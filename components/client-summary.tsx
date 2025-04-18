"use client"

import { useEffect, useState } from "react"
import { getClientStats, getClientGroups } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ClientGroup, ClientStats } from "@/types/index"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ListFilter } from "lucide-react"

// Datos de demostración para v0
const demoClientStats: ClientStats = {
  Fenix: {
    leads: 120,
    expenses: 800.5,
    funding: 1500.0,
    balance: 699.5,
  },
  Eros: {
    leads: 85,
    expenses: 450.25,
    funding: 1000.0,
    balance: 549.75,
  },
  Fortuna: {
    leads: 65,
    expenses: 320.0,
    funding: 800.0,
    balance: 480.0,
  },
  Gana24: {
    leads: 45,
    expenses: 250.0,
    funding: 600.0,
    balance: 350.0,
  },
  Atenea: {
    leads: 30,
    expenses: 180.0,
    funding: 400.0,
    balance: 220.0,
  },
  Flashbet: {
    leads: 20,
    expenses: 150.0,
    funding: 300.0,
    balance: 150.0,
  },
}

const demoClientGroups: ClientGroup[] = [
  {
    id: 1,
    name: "Dueño 1",
    owner: "Dueño 1",
    clients: [
      { id: 1, name: "Fenix", owner_id: 1, created_at: "" },
      { id: 2, name: "Eros", owner_id: 1, created_at: "" },
    ],
  },
  {
    id: 2,
    name: "Dueño 2",
    owner: "Dueño 2",
    clients: [
      { id: 3, name: "Fortuna", owner_id: 2, created_at: "" },
      { id: 4, name: "Gana24", owner_id: 2, created_at: "" },
    ],
  },
  {
    id: 3,
    name: "Dueño 3",
    owner: "Dueño 3",
    clients: [{ id: 5, name: "Atenea", owner_id: 3, created_at: "" }],
  },
  {
    id: 4,
    name: "Dueño 4",
    owner: "Dueño 4",
    clients: [{ id: 6, name: "Flashbet", owner_id: 4, created_at: "" }],
  },
]

interface ClientSummaryProps {
  isV0?: boolean
}

export function ClientSummary() {
  // agregar parametro de from y To
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

// Modificar la función ClientCard para que el botón de ver detalles abra un modal
function ClientCard({ name, stats }: ClientCardProps) {
  return (
    <Card className="bg-white border border-[#e8f3f1] shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="border-b border-[#e8f3f1] flex justify-between items-center">
        <CardTitle className="text-[#0e6251]">{name}</CardTitle>
        <Link href={`/clients/${encodeURIComponent(name)}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ListFilter className="h-4 w-4" />
            <span className="sr-only">Ver registros</span>
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
