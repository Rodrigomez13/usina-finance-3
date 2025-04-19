"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AdvancedReportGenerator } from "@/components/advanced-report-generator"
import { ExpenseChart } from "@/components/charts/expense-chart"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { getClients, getClientGroups, getDailyClientSummary } from "@/lib/api"
import { getCurrentMonthRange, getPreviousMonthRange } from "@/lib/date-utils"
import type { DateRange } from "@/types/index"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("generator")
  const [dateRange, setDateRange] = useState<DateRange>(getCurrentMonthRange())
  const [clients, setClients] = useState<any[]>([])
  const [owners, setOwners] = useState<any[]>([])
  const [dailyData, setDailyData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Cargar clientes y grupos
        const [clientsData, groupsData] = await Promise.all([getClients(), getClientGroups()])

        setClients(clientsData || [])

        // Extraer dueños de los grupos
        const ownersData = groupsData.map((group) => ({
          id: group.id,
          name: group.name,
        }))

        setOwners(ownersData || [])

        // Cargar datos diarios para gráficos
        if (dateRange.from && dateRange.to) {
          const summaryData = await getDailyClientSummary(dateRange.from, dateRange.to)
          setDailyData(summaryData || [])
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  // Manejar cambio de fechas desde el calendario
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range)
    }
  }

  // Procesar datos para gráficos
  const processChartData = () => {
    if (!dailyData || dailyData.length === 0) return []

    // Agrupar por fecha
    const groupedByDate = dailyData.reduce((acc: any, item: any) => {
      const date = item.date

      if (!acc[date]) {
        acc[date] = {
          date,
          expenses: 0,
          leads: 0,
          funding: 0,
        }
      }

      acc[date].expenses += Number(item.expenses || 0)
      acc[date].leads += Number(item.leads || 0)
      acc[date].funding += Number(item.funding || 0)

      return acc
    }, {})

    // Convertir a array y ordenar por fecha
    return Object.values(groupedByDate).sort(
      (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
  }

  const chartData = processChartData()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-[#0e6251]">Reportes Financieros</h2>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker onDateChange={handleDateRangeChange} />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white border border-[#e8f3f1] shadow-sm">
          <TabsTrigger
            value="generator"
            className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white text-[#34495e]"
          >
            Generador de Reportes
          </TabsTrigger>
          <TabsTrigger
            value="charts"
            className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white text-[#34495e]"
          >
            Gráficos
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white text-[#34495e]"
          >
            Plantillas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-4">
          <AdvancedReportGenerator clients={clients} owners={owners} />
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="h-[300px] flex items-center justify-center">
                  <p>Cargando datos...</p>
                </div>
              </CardContent>
            </Card>
          ) : chartData.length > 0 ? (
            <ExpenseChart data={chartData} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="h-[300px] flex items-center justify-center">
                  <p>No hay datos disponibles para el rango de fechas seleccionado.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#0e6251]">Plantillas de Reportes</CardTitle>
              <CardDescription>Reportes predefinidos para casos de uso comunes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-[#f8fcfb] border border-[#e8f3f1] shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-[#34495e]">Reporte Mensual Completo</CardTitle>
                    <CardDescription>Incluye todas las transacciones y gastos del mes</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Button
                      className="w-full bg-[#148f77] hover:bg-[#0e6251] text-white"
                      onClick={() => {
                        const prevMonth = getPreviousMonthRange()
                        window.open(
                          `/api/reports/advanced-generate?start_date=${prevMonth.from?.toISOString()}&end_date=${prevMonth.to?.toISOString()}&report_type=detailed&format=pdf`,
                          "_blank",
                        )
                      }}
                    >
                      Generar Reporte
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#f8fcfb] border border-[#e8f3f1] shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-[#34495e]">Análisis de Rendimiento</CardTitle>
                    <CardDescription>Análisis detallado de métricas y tendencias</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Button
                      className="w-full bg-[#148f77] hover:bg-[#0e6251] text-white"
                      onClick={() => {
                        const prevMonth = getPreviousMonthRange()
                        window.open(
                          `/api/reports/advanced-generate?start_date=${prevMonth.from?.toISOString()}&end_date=${prevMonth.to?.toISOString()}&report_type=analytical&format=pdf`,
                          "_blank",
                        )
                      }}
                    >
                      Generar Reporte
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-[#f8fcfb] border border-[#e8f3f1] shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-[#34495e]">Resumen Ejecutivo</CardTitle>
                    <CardDescription>Resumen conciso para presentaciones ejecutivas</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Button
                      className="w-full bg-[#148f77] hover:bg-[#0e6251] text-white"
                      onClick={() => {
                        const prevMonth = getPreviousMonthRange()
                        window.open(
                          `/api/reports/advanced-generate?start_date=${prevMonth.from?.toISOString()}&end_date=${prevMonth.to?.toISOString()}&report_type=summary&format=pdf&include_charts=true&include_transactions=false&include_admin_expenses=false`,
                          "_blank",
                        )
                      }}
                    >
                      Generar Reporte
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
