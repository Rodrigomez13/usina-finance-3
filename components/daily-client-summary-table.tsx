// components/daily-client-summary-table.tsx
"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getDailyClientSummary } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'
import { format, eachDayOfInterval } from "date-fns"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DailyClientSummaryTableProps {
  dateRange?: {
    from: Date
    to: Date
  }
}

interface DailySummary {
  date: string
  client_id: number
  client_name: string
  leads: number
  expenses: number
  funding: number
  balance: number
}

// Datos de demostración para v0
const demoDailySummary: DailySummary[] = [
  // Fenix
  { date: "2025-04-01", client_id: 1, client_name: "Fenix", leads: 15, expenses: 120.5, funding: 300, balance: 179.5 },
  { date: "2025-04-02", client_id: 1, client_name: "Fenix", leads: 12, expenses: 85.75, funding: 0, balance: -85.75 },
  { date: "2025-04-03", client_id: 1, client_name: "Fenix", leads: 18, expenses: 150.25, funding: 200, balance: 49.75 },

  // Eros
  { date: "2025-04-01", client_id: 2, client_name: "Eros", leads: 10, expenses: 80.0, funding: 150, balance: 70.0 },
  { date: "2025-04-02", client_id: 2, client_name: "Eros", leads: 8, expenses: 65.5, funding: 0, balance: -65.5 },
  { date: "2025-04-03", client_id: 2, client_name: "Eros", leads: 12, expenses: 95.25, funding: 100, balance: 4.75 },

  // Fortuna
  { date: "2025-04-01", client_id: 3, client_name: "Fortuna", leads: 8, expenses: 60.0, funding: 120, balance: 60.0 },
  { date: "2025-04-02", client_id: 3, client_name: "Fortuna", leads: 6, expenses: 45.5, funding: 0, balance: -45.5 },
  { date: "2025-04-03", client_id: 3, client_name: "Fortuna", leads: 9, expenses: 75.25, funding: 80, balance: 4.75 },
]

export function DailyClientSummaryTable({ dateRange }: DailyClientSummaryTableProps) {
  const [summaryData, setSummaryData] = useState<DailySummary[]>([])
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<string[]>([])
  const [dates, setDates] = useState<Date[]>([])
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("todos")

  // Función para detectar si estamos en el entorno de v0
  const isV0Environment = () => {
    if (typeof window === "undefined") return false
    return window.location.hostname.includes("v0.dev")
  }

  useEffect(() => {
    async function fetchDailySummary() {
      try {
        setLoading(true)
        setError(null)

        // Si estamos en v0, usar datos de demostración
        if (isV0Environment()) {
          console.log("Usando datos de demostración para v0")
          setTimeout(() => {
            setSummaryData(demoDailySummary)

            // Extraer clientes únicos
            const uniqueClients = Array.from(new Set(demoDailySummary.map((item) => item.client_name)))
            setClients(uniqueClients)

            // Extraer fechas únicas y ordenarlas
            const uniqueDates = Array.from(
              new Set(demoDailySummary.map((item) => new Date(item.date)))
            ).sort((a, b) => a.getTime() - b.getTime())

            setDates(uniqueDates)
            setLoading(false)
          }, 1000)
          return
        }

        // Obtener datos reales desde la API
        const from = dateRange?.from || new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        const to = dateRange?.to || new Date()

        console.log("Fechas para consulta:", from.toISOString(), to.toISOString())

        const data = await getDailyClientSummary(from, to)
        console.log("Datos recibidos:", data)

        if (!data || data.length === 0) {
          setError("No se encontraron datos para el período seleccionado")
          setLoading(false)
          return
        }

        setSummaryData(data)

        // Extraer clientes únicos
        const uniqueClients = Array.from(new Set(data.map((item: DailySummary) => item.client_name)))
        setClients(uniqueClients)

        // Generar todas las fechas en el rango
        if (from && to) {
          const datesInRange = eachDayOfInterval({ start: from, end: to })
          setDates(datesInRange)
        }
      } catch (error: any) {
        console.error("Error al cargar resumen diario:", error)
        setError(`Error al cargar datos: ${error.message || "Error desconocido"}`)
      } finally {
        setLoading(false)
      }
    }

    fetchDailySummary()
  }, [dateRange])

  // Función para formatear la fecha
  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy")
  }

  // Función para obtener los datos de un cliente en una fecha específica
  const getClientDataForDate = (clientName: string, date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    return (
      summaryData.find((item) => item.client_name === clientName && item.date.substring(0, 10) === dateStr) || {
        date: dateStr,
        client_id: 0,
        client_name: clientName,
        leads: 0,
        expenses: 0,
        funding: 0,
        balance: 0,
      }
    )
  }

  // Función para calcular el CAC (Cost per Acquisition) para una fecha
  const calculateCacForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    const dayData = summaryData.filter((item) => item.date.substring(0, 10) === dateStr)

    const totalLeads = dayData.reduce((sum, item) => sum + item.leads, 0)
    const totalExpenses = dayData.reduce((sum, item) => sum + item.expenses, 0)

    if (totalLeads === 0) return 0
    return totalExpenses / totalLeads
  }

  // Función para exportar a CSV
  const exportToCSV = () => {
    // Crear encabezados
    const headers = ["Fecha"]

    if (activeTab === "todos") {
      headers.push("CAC", "Leads", "Gastos", "Fondeos", "Balance")
    } else {
      headers.push("Leads", "Gastos", "Fondeos", "Balance")
    }

    // Crear filas
    const rows = []
    for (const date of dates) {
      const row = [format(date, "yyyy-MM-dd")]

      if (activeTab === "todos") {
        const cac = calculateCacForDate(date)
        const totalLeads = clients.reduce((sum, client) => sum + getClientDataForDate(client, date).leads, 0)
        const totalExpenses = clients.reduce((sum, client) => sum + getClientDataForDate(client, date).expenses, 0)
        const totalFunding = clients.reduce((sum, client) => sum + getClientDataForDate(client, date).funding, 0)
        const totalBalance = totalFunding - totalExpenses

        row.push(
          cac.toFixed(2),
          totalLeads.toString(),
          totalExpenses.toFixed(2),
          totalFunding.toFixed(2),
          totalBalance.toFixed(2)
        )
      } else {
        const clientData = getClientDataForDate(activeTab, date)
        row.push(
          clientData.leads.toString(),
          clientData.expenses.toFixed(2),
          clientData.funding.toFixed(2),
          clientData.balance.toFixed(2)
        )
      }

      rows.push(row)
    }

    // Crear contenido CSV
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `resumen_diario_${format(new Date(), "yyyy-MM-dd")}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end mb-4">
          <Skeleton className="h-9 w-36" />
        </div>
        <div className="overflow-x-auto">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  if (dates.length === 0 || clients.length === 0) {
    return (
      <div className="text-center p-8 text-[#7f8c8d]">
        <p>No hay datos disponibles para el período seleccionado.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border border-[#e8f3f1] shadow-sm">
            <TabsTrigger
              value="todos"
              className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white text-[#34495e]"
            >
              Todos
            </TabsTrigger>
            {clients.map((client) => (
              <TabsTrigger
                key={client}
                value={client}
                className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white text-[#34495e]"
              >
                {client}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button
          onClick={exportToCSV}
          variant="outline"
          className="flex items-center gap-2 border-[#a2d9ce] text-[#148f77] hover:bg-[#f0f9f7] ml-4"
        >
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table className="border-collapse">
          <TableHeader className="bg-[#f0f9f7]">
            <TableRow>
              <TableHead className="border border-[#e8f3f1] font-bold text-[#0e6251] sticky left-0 bg-[#f0f9f7] min-w-[120px]">
                Fecha
              </TableHead>
              {activeTab === "todos" ? (
                <>
                  <TableHead className="border border-[#e8f3f1] text-center font-medium text-[#0e6251]">CAC</TableHead>
                  <TableHead className="border border-[#e8f3f1] text-center font-medium text-[#0e6251]">
                    Leads
                  </TableHead>
                  <TableHead className="border border-[#e8f3f1] text-center font-medium text-[#0e6251]">
                    Gasto
                  </TableHead>
                  <TableHead className="border border-[#e8f3f1] text-center font-medium text-[#0e6251]">
                    Fondeo
                  </TableHead>
                  <TableHead className="border border-[#e8f3f1] text-center font-medium text-[#0e6251]">
                    Balance
                  </TableHead>
                </>
              ) : (
                <>
                  <TableHead className="border border-[#e8f3f1] text-center font-medium text-[#0e6251]">
                    Leads
                  </TableHead>
                  <TableHead className="border border-[#e8f3f1] text-center font-medium text-[#0e6251]">
                    Gasto
                  </TableHead>
                  <TableHead className="border border-[#e8f3f1] text-center font-medium text-[#0e6251]">
                    Fondeo
                  </TableHead>
                  <TableHead className="border border-[#e8f3f1] text-center font-medium text-[#0e6251]">
                    Balance
                  </TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {dates.map((date, index) => (
              <TableRow key={index} className={index % 2 === 0 ? "bg-white" : "bg-[#f8fcfb]"}>
                <TableCell className="border border-[#e8f3f1] font-medium text-[#34495e] sticky left-0 bg-inherit">
                  {formatDate(date)}
                </TableCell>

                {activeTab === "todos" ? (
                  <>
                    <TableCell className="border border-[#e8f3f1] text-center">
                      ${calculateCacForDate(date).toFixed(2)}
                    </TableCell>
                    <TableCell className="border border-[#e8f3f1] text-center">
                      {clients.reduce((sum, client) => sum + getClientDataForDate(client, date).leads, 0)}
                    </TableCell>
                    <TableCell className="border border-[#e8f3f1] text-center text-red-600">
                      $
                      {clients.reduce((sum, client) => sum + getClientDataForDate(client, date).expenses, 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="border border-[#e8f3f1] text-center text-green-600">
                      ${clients.reduce((sum, client) => sum + getClientDataForDate(client, date).funding, 0).toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={`border border-[#e8f3f1] text-center font-medium ${
                        clients.reduce((sum, client) => sum + getClientDataForDate(client, date).funding, 0) -
                          clients.reduce((sum, client) => sum + getClientDataForDate(client, date).expenses, 0) >=
                        0
                          ? "text-[#148f77]"
                          : "text-red-600"
                      }`}
                    >
                      $
                      {(
                        clients.reduce((sum, client) => sum + getClientDataForDate(client, date).funding, 0) -
                        clients.reduce((sum, client) => sum + getClientDataForDate(client, date).expenses, 0)
                      ).toFixed(2)}
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="border border-[#e8f3f1] text-center">
                      {getClientDataForDate(activeTab, date).leads}
                    </TableCell>
                    <TableCell className="border border-[#e8f3f1] text-center text-red-600">
                      ${getClientDataForDate(activeTab, date).expenses.toFixed(2)}
                    </TableCell>
                    <TableCell className="border border-[#e8f3f1] text-center text-green-600">
                      ${getClientDataForDate(activeTab, date).funding.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={`border border-[#e8f3f1] text-center font-medium ${
                        getClientDataForDate(activeTab, date).balance >= 0 ? "text-[#148f77]" : "text-red-600"
                      }`}
                    >
                      ${getClientDataForDate(activeTab, date).balance.toFixed(2)}
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
