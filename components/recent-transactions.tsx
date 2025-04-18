"use client"

import { useEffect, useState } from "react"
import { getRecentTransactions, getRecentAdminExpenses } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Transaction } from "@/types/index"
import type { DateRange } from "react-day-picker"

// Datos de demostración para v0
const demoTransactions: Transaction[] = [
  {
    id: 1,
    client_id: 1,
    type: "funding",
    amount: 1000,
    date: new Date().toISOString(),
    notes: "Fondeo inicial",
    payment_method: "transfer",
    category: null,
    cost_per_lead: null,
    created_at: new Date().toISOString(),
    created_by: "admin@example.com",
    clients: { name: "Fenix" },
  },
  {
    id: 2,
    client_id: 2,
    type: "expense",
    amount: 250.5,
    date: new Date().toISOString(),
    notes: "Publicidad en Facebook",
    payment_method: "transfer",
    category: "advertising",
    cost_per_lead: null,
    created_at: new Date().toISOString(),
    created_by: "admin@example.com",
    clients: { name: "Eros" },
  },
  {
    id: 3,
    client_id: 3,
    type: "lead",
    amount: 50,
    date: new Date().toISOString(),
    notes: "Leads de campaña de abril",
    payment_method: null,
    category: null,
    cost_per_lead: null,
    created_at: new Date().toISOString(),
    created_by: "admin@example.com",
    clients: { name: "Fortuna" },
  },
  {
    id: 4,
    client_id: 4,
    type: "expense",
    amount: 120.75,
    date: new Date(Date.now() - 86400000).toISOString(), // Ayer
    notes: "Servicios de diseño",
    payment_method: "card",
    category: "services",
    cost_per_lead: null,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    created_by: "admin@example.com",
    clients: { name: "Gana24" },
  },
  {
    id: 5,
    client_id: 5,
    type: "funding",
    amount: 500,
    date: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
    notes: "Fondeo mensual",
    payment_method: "transfer",
    category: null,
    cost_per_lead: null,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    created_by: "admin@example.com",
    clients: { name: "Atenea" },
  },
]

interface RecentTransactionsProps {
  isV0?: boolean
  dateRange?: DateRange | undefined
}

// Modificar la función RecentTransactions para incluir gastos administrativos
export function RecentTransactions({ isV0 = false, dateRange }: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [adminExpenses, setAdminExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // If estamos en v0, usar datos de demostración
        if (isV0) {
          console.log("Usando transacciones de demostración para v0")
          setTimeout(() => {
            setTransactions(demoTransactions)
            setAdminExpenses([
              {
                id: 101,
                concept: "Alquiler de oficina",
                amount: 500,
                date: new Date().toISOString(),
                status: "pending",
                client_name: "Compartido",
              },
              {
                id: 102,
                concept: "Servicios de internet",
                amount: 100,
                date: new Date(Date.now() - 86400000).toISOString(),
                status: "paid",
                client_name: "Compartido",
              },
            ])
            setLoading(false)
          }, 500) // Simular carga
          return
        }

        // Obtener fechas del rango o usar valores predeterminados
        const startDate = dateRange?.from || new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        const endDate = dateRange?.to || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)

        // Obtener transacciones y gastos administrativos
        const [txData, expData] = await Promise.all([
          getRecentTransactions(startDate, endDate),
          getRecentAdminExpenses(startDate, endDate),
        ])

        setTransactions(txData || [])
        setAdminExpenses(expData || [])
      } catch (error) {
        console.error("Error al cargar datos recientes:", error)
        setTransactions([])
        setAdminExpenses([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [isV0, dateRange])

  // Combinar transacciones y gastos administrativos, y ordenar por fecha
  const combinedItems = [...transactions, ...adminExpenses]
    .sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
    .slice(0, 5) // Mostrar solo los 5 más recientes

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-gray-50 animate-pulse">
            <CardContent className="p-4 h-16"></CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (combinedItems.length === 0) {
    return <p className="text-center text-gray-500 py-4">No hay transacciones recientes</p>
  }

  return (
    <div className="space-y-3">
      {combinedItems.map((item: any) => (
        <Card key={item.id} className="hover:bg-gray-50 transition-colors">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">
                  {item.concept
                    ? `${item.concept} (${item.client_name || "Compartido"})`
                    : item.clients?.name || "Cliente desconocido"}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(item.date).toLocaleDateString("es-ES")} - {item.notes || "Sin notas"}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <p className="font-bold">${item.amount.toFixed(2)}</p>
                <Badge
                  className={
                    item.concept
                      ? item.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                      : item.type === "funding"
                        ? "bg-green-100 text-green-800"
                        : item.type === "expense"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                  }
                >
                  {item.concept
                    ? `Gasto Admin. ${item.status === "paid" ? "Pagado" : "Pendiente"}`
                    : item.type === "funding"
                      ? "Fondeo"
                      : item.type === "expense"
                        ? "Gasto"
                        : "Leads"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
