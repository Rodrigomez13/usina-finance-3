"use client"

import { useEffect, useState } from "react"
import { getClientStats, getClientGroups } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ClientGroup, ClientStats } from "@/types/index"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { DateRange } from "react-day-picker"

interface ClientSummaryProps {
  dateRange?: DateRange | undefined
}

export function ClientSummary({ dateRange }: ClientSummaryProps) {
  const [clientStats, setClientStats] = useState<ClientStats>({})
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Obtener fechas del rango o usar valores predeterminadas
        const startDate = dateRange?.from || new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        const endDate = dateRange?.to || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

        const [stats, groups] = await Promise.all([getClientStats(startDate, endDate), getClientGroups()])

        setClientStats(stats || {})
        setClientGroups(groups || [])
      } catch (error) {
        console.error("Error al cargar datos de clientes:", error)
        setClientStats({})
        setClientGroups([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateRange])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-gray-50 animate-pulse">
            <CardHeader className="h-16"></CardHeader>
            <CardContent className="h-32"></CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-white border border-[#e8f3f1] shadow-sm">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white text-[#34495e]"
          >
            Todos los Clientes
          </TabsTrigger>
          {clientGroups.map((group) => (
            <TabsTrigger
              key={group.id}
              value={`group-${group.id}`}
              className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white text-[#34495e]"
            >
              {group.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(clientStats).map(([clientName, stats]) => (
              <ClientCard key={clientName} name={clientName} stats={stats} />
            ))}
          </div>
        </TabsContent>

        {clientGroups.map((group) => (
          <TabsContent key={group.id} value={`group-${group.id}`} className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.clients.map((client) => (
                <ClientCard
                  key={client.id}
                  name={client.name}
                  stats={clientStats[client.name] || { leads: 0, expenses: 0, funding: 0, balance: 0 }}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

interface ClientCardProps {
  name: string
  stats: {
    leads: number
    expenses: number
    funding: number
    balance: number
  }
}

function ClientCard({ name, stats }: ClientCardProps) {
  return (
    <Card className="bg-white border border-[#e8f3f1] shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="border-b border-[#e8f3f1] flex justify-between items-center">
        <CardTitle className="text-[#0e6251]">{name}</CardTitle>
        <Link href={`/clients/${encodeURIComponent(name)}`}>
          <Button
            variant="outline"
            size="sm"
            className="text-[#148f77] hover:text-[#0e6251] hover:bg-[#f0f9f7] border-[#a2d9ce]"
          >
            Ver Detalles
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-[#7f8c8d]">Leads:</span>
            <span className="font-medium">{stats.leads}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#7f8c8d]">Gastos:</span>
            <span className="font-medium">${stats.expenses.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#7f8c8d]">Fondeos:</span>
            <span className="font-medium">${stats.funding.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-[#e8f3f1]">
            <span className="font-bold text-[#34495e]">Balance:</span>
            <span className={`font-bold ${stats.balance >= 0 ? "text-[#148f77]" : "text-[#e74c3c]"}`}>
              ${stats.balance.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
