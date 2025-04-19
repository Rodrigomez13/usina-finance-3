"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { Button } from "@/components/ui/button"
import { addDays } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

// Datos de ejemplo para los gráficos
const generateDemoData = () => {
  const data = []
  const startDate = new Date(2025, 3, 1)

  for (let i = 0; i < 15; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)

    data.push({
      date: date.toISOString().split("T")[0],
      gastos: Math.floor(Math.random() * 500) + 100,
      fondeos: Math.floor(Math.random() * 800) + 200,
      leads: Math.floor(Math.random() * 30) + 5,
    })
  }

  return data
}

const generateClientData = () => {
  const clients = ["Fenix", "Eros", "Fortuna", "Gana24", "Atenea"]
  return clients.map((client) => ({
    name: client,
    gastos: Math.floor(Math.random() * 2000) + 500,
    fondeos: Math.floor(Math.random() * 3000) + 1000,
    leads: Math.floor(Math.random() * 100) + 20,
  }))
}

export default function ChartsPage() {
  const router = useRouter()
  const [date, setDate] = useState<{
    from: Date
    to: Date
  }>({
    from: addDays(new Date(), -14),
    to: new Date(),
  })

  const demoData = generateDemoData()
  const clientData = generateClientData()

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/")}
            className="border-[#a2d9ce] hover:bg-[#f0f9f7] hover:text-[#0e6251]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver</span>
          </Button>
          <h1 className="text-3xl font-bold text-[#0e6251]">Gráficos y Análisis</h1>
        </div>
        <CalendarDateRangePicker date={date} setDate={setDate} />
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 bg-white border border-[#e8f3f1] shadow-sm">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white text-[#34495e]"
          >
            Resumen General
          </TabsTrigger>
          <TabsTrigger
            value="clients"
            className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white text-[#34495e]"
          >
            Por Cliente
          </TabsTrigger>
          <TabsTrigger
            value="trends"
            className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white text-[#34495e]"
          >
            Tendencias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white shadow-md border-[#e8f3f1]">
              <CardHeader className="bg-gradient-to-r from-[#f0f9f7] to-white">
                <CardTitle className="text-xl text-[#0e6251]">Gastos vs Fondeos</CardTitle>
                <CardDescription>Comparativa diaria de gastos y fondeos</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={demoData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="gastos" name="Gastos" fill="#e74c3c" />
                      <Bar dataKey="fondeos" name="Fondeos" fill="#2ecc71" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md border-[#e8f3f1]">
              <CardHeader className="bg-gradient-to-r from-[#f0f9f7] to-white">
                <CardTitle className="text-xl text-[#0e6251]">Leads Generados</CardTitle>
                <CardDescription>Evolución diaria de leads generados</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={demoData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="leads" name="Leads" stroke="#3498db" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients">
          <Card className="bg-white shadow-md border-[#e8f3f1]">
            <CardHeader className="bg-gradient-to-r from-[#f0f9f7] to-white">
              <CardTitle className="text-xl text-[#0e6251]">Comparativa por Cliente</CardTitle>
              <CardDescription>Gastos, fondeos y leads por cliente</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={clientData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="gastos" name="Gastos" fill="#e74c3c" />
                    <Bar dataKey="fondeos" name="Fondeos" fill="#2ecc71" />
                    <Bar dataKey="leads" name="Leads" fill="#3498db" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card className="bg-white shadow-md border-[#e8f3f1]">
            <CardHeader className="bg-gradient-to-r from-[#f0f9f7] to-white">
              <CardTitle className="text-xl text-[#0e6251]">Tendencias</CardTitle>
              <CardDescription>Análisis de tendencias en el tiempo</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={demoData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="gastos"
                      name="Gastos"
                      stroke="#e74c3c"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="fondeos"
                      name="Fondeos"
                      stroke="#2ecc71"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="leads"
                      name="Leads"
                      stroke="#3498db"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
