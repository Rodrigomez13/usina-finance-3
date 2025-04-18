"use client"

import { useEffect, useState } from "react"
import { getRecentTransactionsByDate } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RecentTransactionsByDateProps {
  dateRange: {
    from: Date
    to: Date
  }
}

interface TransactionByDate {
  transaction_id: number
  owner_name: string
  client_name: string
  type: string
  amount: number
  date: Date
  notes: string
}

export function RecentTransactionsByDate({ dateRange }: RecentTransactionsByDateProps) {
  const [transactions, setTransactions] = useState<TransactionByDate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true)

        const data = await getRecentTransactionsByDate(dateRange.from, dateRange.to)
        setTransactions(data || [])
      } catch (error) {
        console.error("Error al cargar transacciones recientes:", error)
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [dateRange])

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

  if (transactions.length === 0) {
    return <p className="text-center text-gray-500 py-4">No hay transacciones recientes</p>
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx: TransactionByDate) => (
        <Card key={tx.transaction_id} className="hover:bg-gray-50 transition-colors">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{tx.client_name || "Cliente desconocido"}</p>
                <p className="text-sm text-gray-500">
                  {new Date(tx.date).toLocaleDateString("es-ES")} - {tx.notes || "Sin notas"}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <p className="font-bold">${tx.amount.toFixed(2)}</p>
                <Badge
                  className={
                    tx.type === "funding"
                      ? "bg-green-100 text-green-800"
                      : tx.type === "expense"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                  }
                >
                  {tx.type === "funding" ? "Fondeo" : tx.type === "expense" ? "Gasto" : "Leads"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
