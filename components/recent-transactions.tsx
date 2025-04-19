"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Transaction {
  id: number
  client_id: number
  type: "funding" | "expense" | "lead"
  amount: number
  date: string
  notes?: string
  clients: {
    name: string
  }
}

export function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTransactions() {
      try {
        // En una implementación real, esto sería una llamada a la API
        // Por ahora, usamos datos de ejemplo
        const demoTransactions: Transaction[] = [
          {
            id: 1,
            client_id: 1,
            type: "expense",
            amount: 460,
            date: "2025-04-18T10:00:00Z",
            notes: "Publicidad server 4",
            clients: { name: "Atenea" },
          },
          {
            id: 2,
            client_id: 1,
            type: "lead",
            amount: 100,
            date: "2025-04-18T10:00:00Z",
            notes: "Publicidad server 4",
            clients: { name: "Atenea" },
          },
          {
            id: 3,
            client_id: 2,
            type: "expense",
            amount: 249.75,
            date: "2025-04-17T14:30:00Z",
            notes: "Gasto administrativo: Prueba de gasto",
            clients: { name: "Gana24" },
          },
          {
            id: 4,
            client_id: 3,
            type: "funding",
            amount: 1000,
            date: "2025-04-16T09:15:00Z",
            notes: "Fondeo inicial",
            clients: { name: "Fenix" },
          },
          {
            id: 5,
            client_id: 4,
            type: "expense",
            amount: 350.25,
            date: "2025-04-15T16:45:00Z",
            notes: "Publicidad Facebook",
            clients: { name: "Flash" },
          },
        ]

        // Filtrar para no mostrar leads en las transacciones recientes
        const filteredTransactions = demoTransactions.filter((tx) => tx.type !== "lead")

        setTransactions(filteredTransactions)
        setLoading(false)
      } catch (error) {
        console.error("Error al cargar transacciones recientes:", error)
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [])

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: es })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl text-[#0e6251]">Transacciones Recientes</CardTitle>
        <CardDescription>Se muestran las últimas 5 transacciones</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#148f77]"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8 text-[#7f8c8d]">No hay transacciones recientes</div>
        ) : (
          <div className="divide-y divide-[#e8f3f1]">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none text-[#2c3e50]">{transaction.clients.name}</p>
                  <p className="text-sm text-[#7f8c8d]">
                    {formatDate(transaction.date)} - {transaction.notes}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">
                    {transaction.type === "funding" ? "+" : "-"}${transaction.amount.toFixed(2)}
                  </p>
                  <Badge
                    className={
                      transaction.type === "funding"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : transaction.type === "expense"
                          ? "bg-red-100 text-red-800 hover:bg-red-100"
                          : "bg-blue-100 text-blue-800 hover:bg-blue-100"
                    }
                  >
                    {transaction.type === "funding" ? "Fondeo" : transaction.type === "expense" ? "Gasto" : "Leads"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
