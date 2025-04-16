"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { supabase } from "@/lib/supabase"

interface MonthlyData {
  name: string
  leads: number
  gastos: number
  fondeos: number
}

export function Overview() {
  const [data, setData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMonthlyData() {
      try {
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
        const currentDate = new Date()
        const currentYear = currentDate.getFullYear()
        const currentMonth = currentDate.getMonth()

        const monthlyData: MonthlyData[] = []

        // Obtener datos para los últimos 4 meses
        for (let i = 3; i >= 0; i--) {
          const month = currentMonth - i
          const year = currentYear + Math.floor((currentMonth - i) / 12)
          const adjustedMonth = ((month % 12) + 12) % 12 // Asegurarse de que el mes esté entre 0-11

          const startDate = new Date(year, adjustedMonth, 1).toISOString()
          const endDate = new Date(year, adjustedMonth + 1, 0).toISOString()

          // Obtener leads
          const { data: leadsData } = await supabase
            .from("transactions")
            .select("amount")
            .eq("type", "lead")
            .gte("date", startDate)
            .lte("date", endDate)

          // Obtener gastos
          const { data: expensesData } = await supabase
            .from("transactions")
            .select("amount")
            .eq("type", "expense")
            .gte("date", startDate)
            .lte("date", endDate)

          // Obtener fondeos
          const { data: fundingData } = await supabase
            .from("transactions")
            .select("amount")
            .eq("type", "funding")
            .gte("date", startDate)
            .lte("date", endDate)

          const totalLeads = leadsData?.reduce((sum, item) => sum + item.amount, 0) || 0
          const totalExpenses = expensesData?.reduce((sum, item) => sum + item.amount, 0) || 0
          const totalFunding = fundingData?.reduce((sum, item) => sum + item.amount, 0) || 0

          monthlyData.push({
            name: months[adjustedMonth],
            leads: totalLeads,
            gastos: totalExpenses,
            fondeos: totalFunding,
          })
        }

        setData(monthlyData)
      } catch (error) {
        console.error("Error fetching monthly data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMonthlyData()
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-lilac-300">Cargando datos...</div>
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1e1b5a",
            borderColor: "#4338e0",
            color: "#fff",
          }}
          formatter={(value, name) => {
            if (name === "leads") return [value, "Leads"]
            if (name === "gastos") return [`$${value}`, "Gastos"]
            if (name === "fondeos") return [`$${value}`, "Fondeos"]
            return [value, name]
          }}
        />
        <Legend
          formatter={(value) => {
            if (value === "leads") return "Leads"
            if (value === "gastos") return "Gastos"
            if (value === "fondeos") return "Fondeos"
            return value
          }}
          wrapperStyle={{ color: "#c4b5fd" }}
        />
        <Bar dataKey="leads" fill="#a78bfa" radius={[4, 4, 0, 0]} />
        <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
        <Bar dataKey="fondeos" fill="#5046f5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
