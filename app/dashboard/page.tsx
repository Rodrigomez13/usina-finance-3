"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { RecentTransactions } from "@/components/recent-transactions"
import { ClientSummary } from "@/components/client-summary"
import { AdminExpenses } from "@/components/admin-expenses"
import { PlusCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getDashboardStats } from "@/lib/api"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RecentTransactionsByDate } from '../../components/recent-transactions-by-date';

// Función para detectar si estamos en el entorno de v0
const isV0Environment = () => {
  if (typeof window === "undefined") return false
  return window.location.hostname.includes("v0.dev")
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalExpenses: 0,
    totalFunding: 0,
    balance: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isV0, setIsV0] = useState(false)

  const [calendarDates, setCalendarDates] = useState({
    from: new Date(2025, 3, 1),
    to: new Date(),
  })


  useEffect(() => {
    // Detectar inmediatamente si estamos en v0
    const v0Detected = isV0Environment()
    console.log("¿Entorno v0 detectado?", v0Detected)
    setIsV0(v0Detected)

    async function fetchStats() {
      try {
        setLoading(true)
        setError(null)
        console.log("Iniciando carga de estadísticas del dashboard...")

        // Si estamos en v0, usar datos de demostración directamente
        if (v0Detected) {
          console.log("Usando datos de demostración para v0")
          setTimeout(() => {
            setStats({
              totalLeads: 250,
              totalExpenses: 1500.75,
              totalFunding: 3000.5,
              balance: 1499.75,
            })
            setLoading(false)
          }, 1000) // Simular carga
          return
        }

        // Si no estamos en v0, intentar obtener datos reales
        const dashboardStats = await getDashboardStats()
        console.log("Estadísticas obtenidas:", dashboardStats)
        setStats(dashboardStats)
      } catch (error: any) {
        console.error("Error al cargar estadísticas del dashboard:", error)
        setError(`Error al cargar datos: ${error.message || "Error desconocido"}`)
        // Establecer valores por defecto en caso de error
        setStats({
          totalLeads: 0,
          totalExpenses: 0,
          totalFunding: 0,
          balance: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-[#0e6251]">Dashboard Financiero</h2>
        <div className="flex items-center space-x-2">

        <CalendarDateRangePicker 
          onDateChange={(dateRange): any => {
            console.log("Rango seleccionado:", dateRange)
            
            if (dateRange && dateRange.from && dateRange.to) {
              setCalendarDates({
                from: dateRange.from,
                to: dateRange.to,
              })
            }

          }}
        />
          <Link href="/transactions/new">
            <Button className="bg-[#148f77] hover:bg-[#0e6251] text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Transacción
            </Button>
          </Link>
        </div>
      </div>

      {isV0 && (
        <Alert className="bg-[#d5f5e3] border-[#a2d9ce] text-[#0e6251]">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Modo demostración</AlertTitle>
          <AlertDescription>
            Estás viendo datos de demostración en el entorno de v0. Para ver datos reales, debes ejecutar la aplicación
            en un entorno local o de producción con acceso a Supabase.
          </AlertDescription>
        </Alert>
      )}

      {error && !isV0 && (
        <Alert variant="destructive" className="bg-[#fadbd8] border-[#f5b7b1] text-[#943126]">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#148f77] mb-4"></div>
            <p className="text-[#7f8c8d]">Cargando datos del dashboard...</p>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-white border border-[#e8f3f1] shadow-sm">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white text-[#34495e]"
            >
              Resumen
            </TabsTrigger>
            <TabsTrigger
              value="clients"
              className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white text-[#34495e]"
            >
              Clientes
            </TabsTrigger>
            <TabsTrigger
              value="expenses"
              className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white text-[#34495e]"
            >
              Gastos Administrativos
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white text-[#34495e]"
            >
              Reportes
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-white border border-[#e8f3f1] shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#34495e]">Total de Leads</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#148f77]">{stats.totalLeads}</div>
                  <p className="text-xs text-[#7f8c8d]">Actualizado en tiempo real</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-[#e8f3f1] shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#34495e]">Gastos Totales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#148f77]">${stats.totalExpenses.toFixed(2)}</div>
                  <p className="text-xs text-[#7f8c8d]">Actualizado en tiempo real</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-[#e8f3f1] shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#34495e]">Fondeos Recibidos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#148f77]">${stats.totalFunding.toFixed(2)}</div>
                  <p className="text-xs text-[#7f8c8d]">Actualizado en tiempo real</p>
                </CardContent>
              </Card>
              <Card className="bg-white border border-[#e8f3f1] shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#34495e]">Balance Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-[#148f77]">${stats.balance.toFixed(2)}</div>
                  <p className="text-xs text-[#7f8c8d]">Actualizado en tiempo real</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 bg-white border border-[#e8f3f1] shadow-sm">
                <CardHeader className="border-b border-[#e8f3f1]">
                  <CardTitle className="text-[#0e6251]">Resumen Mensual</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center p-8 text-[#7f8c8d]">
                    <p className="mb-4">Los datos de resumen mensual están disponibles en formato tabular.</p>
                    <Button className="bg-[#148f77] hover:bg-[#0e6251] text-white">Ver Reporte Detallado</Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="col-span-3 bg-white border border-[#e8f3f1] shadow-sm">
                <CardHeader className="border-b border-[#e8f3f1]">
                  <CardTitle className="text-[#0e6251]">Transacciones Recientes</CardTitle>
                  <CardDescription className="text-[#7f8c8d]">Se muestran las últimas 5 transacciones</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <RecentTransactionsByDate dateRange={calendarDates}/>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="clients" className="space-y-4">
            <ClientSummary isV0={isV0} />
          </TabsContent>
          <TabsContent value="expenses" className="space-y-4">
            <AdminExpenses isV0={isV0} />
          </TabsContent>
          <TabsContent value="reports" className="space-y-4">
            <Card className="bg-white border border-[#e8f3f1] shadow-sm">
              <CardHeader className="border-b border-[#e8f3f1]">
                <CardTitle className="text-[#0e6251]">Reportes Mensuales</CardTitle>
                <CardDescription className="text-[#7f8c8d]">
                  Genere reportes detallados para cada período
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="bg-[#f8fcfb] border border-[#e8f3f1] shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-[#34495e]">Reporte de Abril 2025</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <Button
                        className="w-full bg-[#148f77] hover:bg-[#0e6251] text-white"
                        onClick={() => window.open("/api/reports/generate?month=4&year=2025", "_blank")}
                      >
                        Descargar PDF
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#f8fcfb] border border-[#e8f3f1] shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-[#34495e]">Reporte de Marzo 2025</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <Button
                        className="w-full bg-[#148f77] hover:bg-[#0e6251] text-white"
                        onClick={() => window.open("/api/reports/generate?month=3&year=2025", "_blank")}
                      >
                        Descargar PDF
                      </Button>
                    </CardContent>
                  </Card>
                  <Card className="bg-[#f8fcfb] border border-[#e8f3f1] shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-[#34495e]">Reporte de Febrero 2025</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <Button
                        className="w-full bg-[#148f77] hover:bg-[#0e6251] text-white"
                        onClick={() => window.open("/api/reports/generate?month=2&year=2025", "_blank")}
                      >
                        Descargar PDF
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
