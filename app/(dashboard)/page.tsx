"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { RecentTransactions } from "@/components/recent-transactions"
import { ClientSummary } from "@/components/client-summary"
import { AdminExpenses } from "@/components/admin-expenses"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getDashboardStats } from "@/lib/api"
// Importar el componente AuthDebug al principio del archivo
import { AuthDebug } from "@/components/auth-debug"
import type { DateRange } from "react-day-picker"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalExpenses: 0,
    totalFunding: 0,
    balance: 0,
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 3, 1),
    to: new Date(),
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        // Usar el rango de fechas seleccionado para obtener estadísticas
        const from = dateRange?.from || new Date(2025, 3, 1)
        const to = dateRange?.to || new Date()

        console.log("Obteniendo estadísticas para el rango:", from, to)

        const dashboardStats = await getDashboardStats(from, to)
        console.log("Estadísticas obtenidas:", dashboardStats)
        setStats(dashboardStats)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    if (dateRange?.from && dateRange?.to) {
      fetchStats()
    }
  }, [dateRange]) // Ejecutar cuando cambie el rango de fechas

  // Manejar cambio de fechas desde el calendario
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-[#0e6251]">Dashboard Financiero</h2>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker
            onDateChange={handleDateRangeChange}
            initialDateRange={dateRange} // Añadir esta prop
          />
          <Link href="/transactions/new">
            <Button className="bg-[#148f77] hover:bg-[#0e6251] text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Transacción
            </Button>
          </Link>
        </div>
      </div>
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
                <div className="text-2xl font-bold text-[#148f77]">
                  {loading ? <span className="animate-pulse">Cargando...</span> : stats.totalLeads}
                </div>
                <p className="text-xs text-[#7f8c8d]">Actualizado en tiempo real</p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-[#e8f3f1] shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#34495e]">Gastos Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#148f77]">
                  {loading ? <span className="animate-pulse">Cargando...</span> : `$${stats.totalExpenses.toFixed(2)}`}
                </div>
                <p className="text-xs text-[#7f8c8d]">Actualizado en tiempo real</p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-[#e8f3f1] shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#34495e]">Fondeos Recibidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#148f77]">
                  {loading ? <span className="animate-pulse">Cargando...</span> : `$${stats.totalFunding.toFixed(2)}`}
                </div>
                <p className="text-xs text-[#7f8c8d]">Actualizado en tiempo real</p>
              </CardContent>
            </Card>
            <Card className="bg-white border border-[#e8f3f1] shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#34495e]">Balance Actual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#148f77]">
                  {loading ? <span className="animate-pulse">Cargando...</span> : `$${stats.balance.toFixed(2)}`}
                </div>
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
                <RecentTransactions dateRange={dateRange} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="clients" className="space-y-4">
          <ClientSummary dateRange={dateRange} />
        </TabsContent>
        <TabsContent value="expenses" className="space-y-4">
          <AdminExpenses dateRange={dateRange} />
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card className="bg-white border border-[#e8f3f1] shadow-sm">
            <CardHeader className="border-b border-[#e8f3f1]">
              <CardTitle className="text-[#0e6251]">Reportes Mensuales</CardTitle>
              <CardDescription className="text-[#7f8c8d]">Genere reportes detallados para cada período</CardDescription>
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
      <AuthDebug />
    </div>
  )
}
