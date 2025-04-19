"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, FileDown, FileIcon as FilePdf, FileSpreadsheet } from "lucide-react"
import { formatDate, getCurrentMonthRange } from "@/lib/date-utils"
import type { DateRange } from "@/types/index"

interface AdvancedReportGeneratorProps {
  clients: { id: number; name: string }[]
  owners: { id: number; name: string }[]
}

export function AdvancedReportGenerator({ clients, owners }: AdvancedReportGeneratorProps) {
  const [dateRange, setDateRange] = useState<DateRange>(getCurrentMonthRange())
  const [reportType, setReportType] = useState<"summary" | "detailed" | "analytical">("summary")
  const [selectedClients, setSelectedClients] = useState<number[]>([])
  const [selectedOwner, setSelectedOwner] = useState<number | null>(null)
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeTransactions, setIncludeTransactions] = useState(true)
  const [includeAdminExpenses, setIncludeAdminExpenses] = useState(true)
  const [loading, setLoading] = useState(false)

  // Manejar cambio de fechas desde el calendario
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range)
    }
  }

  // Manejar selección/deselección de cliente
  const toggleClient = (clientId: number) => {
    setSelectedClients((prev) => (prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]))
  }

  // Generar reporte
  const generateReport = async (format: "pdf" | "excel" | "csv") => {
    if (!dateRange.from || !dateRange.to) return

    setLoading(true)

    try {
      // Construir URL con parámetros
      const params = new URLSearchParams()
      params.append("start_date", dateRange.from.toISOString())
      params.append("end_date", dateRange.to.toISOString())
      params.append("report_type", reportType)
      params.append("format", format)

      if (selectedOwner) {
        params.append("owner_id", selectedOwner.toString())
      }

      if (selectedClients.length > 0) {
        params.append("client_ids", selectedClients.join(","))
      }

      params.append("include_charts", includeCharts.toString())
      params.append("include_transactions", includeTransactions.toString())
      params.append("include_admin_expenses", includeAdminExpenses.toString())

      // Llamar a la API para generar el reporte
      const response = await fetch(`/api/reports/advanced-generate?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Error al generar el reporte")
      }

      // Descargar el archivo
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `reporte-${formatDate(dateRange.from, "yyyy-MM-dd")}-a-${formatDate(dateRange.to, "yyyy-MM-dd")}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error al generar reporte:", error)
      // Aquí se podría mostrar un toast de error
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-[#0e6251]">Generador de Reportes Avanzados</CardTitle>
        <CardDescription>Personaliza y genera reportes detallados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1">
            <Label htmlFor="date-range">Rango de fechas</Label>
            <CalendarDateRangePicker onDateChange={handleDateRangeChange} />
          </div>
          <div className="w-full md:w-auto">
            <Label htmlFor="report-type">Tipo de reporte</Label>
            <Select value={reportType} onValueChange={(value) => setReportType(value as any)}>
              <SelectTrigger id="report-type" className="w-full md:w-[180px]">
                <SelectValue placeholder="Tipo de reporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Resumen</SelectItem>
                <SelectItem value="detailed">Detallado</SelectItem>
                <SelectItem value="analytical">Analítico</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Filtrar por dueño</Label>
          <Select
            value={selectedOwner?.toString() || ""}
            onValueChange={(value) => setSelectedOwner(value ? Number.parseInt(value) : null)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los dueños" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los dueños</SelectItem>
              {owners.map((owner) => (
                <SelectItem key={owner.id} value={owner.id.toString()}>
                  {owner.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label>Clientes a incluir</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {clients.map((client) => (
              <div key={client.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`client-${client.id}`}
                  checked={selectedClients.includes(client.id)}
                  onCheckedChange={() => toggleClient(client.id)}
                />
                <Label htmlFor={`client-${client.id}`}>{client.name}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label>Opciones adicionales</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-charts"
                checked={includeCharts}
                onCheckedChange={(checked) => setIncludeCharts(!!checked)}
              />
              <Label htmlFor="include-charts">Incluir gráficos</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-transactions"
                checked={includeTransactions}
                onCheckedChange={(checked) => setIncludeTransactions(!!checked)}
              />
              <Label htmlFor="include-transactions">Incluir transacciones</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-admin-expenses"
                checked={includeAdminExpenses}
                onCheckedChange={(checked) => setIncludeAdminExpenses(!!checked)}
              />
              <Label htmlFor="include-admin-expenses">Incluir gastos administrativos</Label>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => generateReport("pdf")}
          disabled={loading}
          className="w-full sm:w-auto bg-[#e74c3c] hover:bg-[#c0392b] text-white"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FilePdf className="mr-2 h-4 w-4" />}
          Exportar PDF
        </Button>
        <Button
          onClick={() => generateReport("excel")}
          disabled={loading}
          className="w-full sm:w-auto bg-[#27ae60] hover:bg-[#2ecc71] text-white"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
          Exportar Excel
        </Button>
        <Button
          onClick={() => generateReport("csv")}
          disabled={loading}
          className="w-full sm:w-auto bg-[#3498db] hover:bg-[#2980b9] text-white"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
          Exportar CSV
        </Button>
      </CardFooter>
    </Card>
  )
}
