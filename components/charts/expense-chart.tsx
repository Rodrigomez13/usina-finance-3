"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ExpenseChartProps {
  data: {
    date: string
    expenses: number
    leads: number
    funding: number
  }[]
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  const [chartType, setChartType] = useState<"expenses" | "leads" | "funding" | "balance">("expenses")

  // Procesar datos para el gráfico
  const chartData = data.map((item) => ({
    date: item.date,
    expenses: item.expenses,
    leads: item.leads,
    funding: item.funding,
    balance: item.funding - item.expenses,
  }))

  // Determinar el color según el tipo de gráfico
  const getBarColor = () => {
    switch (chartType) {
      case "expenses":
        return "#e74c3c"
      case "leads":
        return "#3498db"
      case "funding":
        return "#2ecc71"
      case "balance":
        return "#f39c12"
      default:
        return "#3498db"
    }
  }

  // Formatear moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(value)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-[#0e6251]">Evolución Financiera</CardTitle>
        <CardDescription>Visualización de datos financieros en el tiempo</CardDescription>
        <Tabs defaultValue="expenses" onValueChange={(value) => setChartType(value as any)}>
          <TabsList className="bg-white border border-[#e8f3f1] shadow-sm">
            <TabsTrigger
              value="expenses"
              className="data-[state=active]:bg-[#e74c3c] data-[state=active]:text-white text-[#34495e]"
            >
              Gastos
            </TabsTrigger>
            <TabsTrigger
              value="leads"
              className="data-[state=active]:bg-[#3498db] data-[state=active]:text-white text-[#34495e]"
            >
              Leads
            </TabsTrigger>
            <TabsTrigger
              value="funding"
              className="data-[state=active]:bg-[#2ecc71] data-[state=active]:text-white text-[#34495e]"
            >
              Fondeo
            </TabsTrigger>
            <TabsTrigger
              value="balance"
              className="data-[state=active]:bg-[#f39c12] data-[state=active]:text-white text-[#34495e]"
            >
              Balance
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => formatCurrency(value).replace("ARS", "")} />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                labelFormatter={(label) => `Fecha: ${label}`}
              />
              <Legend />
              <Bar dataKey={chartType} fill={getBarColor()} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
