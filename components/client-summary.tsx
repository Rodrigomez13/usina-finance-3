"use client"

import { useEffect, useState } from "react"
import { getClientStats, getClientGroups } from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ClientGroup, ClientStats } from "@/types/index"
import { ClientCard } from "./client-card"

interface ClientSummaryProps {
  isV0?: boolean
  dateRange?: {
    from: Date
    to: Date
  }
}

export function ClientSummary({ isV0 = false, dateRange }: ClientSummaryProps) {
  const [clientStats, setClientStats] = useState<ClientStats>({})
  const [clientGroups, setClientGroups] = useState<ClientGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const [stats, groups] = await Promise.all([getClientStats(), getClientGroups()])
        setClientStats(stats || {})
        setClientGroups(groups || [])

        // funcion para filtrar por fecha
      } catch (error) {
        console.error("Error al cargar datos de clientes:", error)
        setClientStats({})
        setClientGroups([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-50 animate-pulse h-48 rounded-lg"></div>
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
            {Object.entries(clientStats).map(([clientName, stats]) => {
              // Buscar el ID del cliente en los grupos
              let clientId = 0
              for (const group of clientGroups) {
                const client = group.clients.find((c) => c.name === clientName)
                if (client) {
                  clientId = client.id
                  break
                }
              }

              return <ClientCard key={clientName} name={clientName} id={clientId} stats={stats} dateRange={dateRange} />
            })}
          </div>
        </TabsContent>

        {clientGroups.map((group) => (
          <TabsContent key={group.id} value={`group-${group.id}`} className="mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.clients.map((client) => (
                <ClientCard
                  key={client.id}
                  name={client.name}
                  id={client.id}
                  stats={clientStats[client.name] || { leads: 0, expenses: 0, funding: 0, balance: 0 }}
                  dateRange={dateRange}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
