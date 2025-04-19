"use client"

import { useEffect, useState } from "react"
import { getRecentTransactions } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Transaction } from "@/types/index"

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
}

export function RecentTransactions({ isV0 = false }: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setLoading(true)

        // Si estamos en v0, usar datos de demostración
        if (isV0) {
          console.log("Usando transacciones de demostración para v0")
          setTimeout(() => {
            setTransactions(demoTransactions)
            setLoading(false)
          }, 500) // Simular carga
          return
        }

        const data = await getRecentTransactions()
        setTransactions(data || [])
      } catch (error) {
        console.error("Error al cargar transacciones recientes:", error)
        setTransactions([])
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()
  }, [isV0])

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
      {transactions.map((tx: Transaction) => (
        <Card key={tx.id} className="hover:bg-gray-50 transition-colors">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{tx.clients?.name || "Cliente desconocido"}</p>
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

// export function RecentTransactions() {

//   let [transactions, setTransactions] = useState<any[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     async function fetchExampleTransactions() {
//       try {
//         setLoading(true)
//         const exampleData = await fetch("https://api.sampleapis.com/coffee/hot").then((res) => res.json())
//         setTransactions(exampleData || [])

//         console.log(transactions);
//       }
//       catch (error) {
//         console.error("Error fetching example transactions:", error)
//         setTransactions([])
//       }
//       finally {
//         setLoading(false)
//       }
//     }
//     fetchExampleTransactions()
//   }, [])

//   return (
//     <>
//       <h1>Cantidad de transacciones: {transactions.length}</h1>
//       <br />
//       { transactions.forEach((transaction) => (
//         <div key={transaction.id}>
//           <p>{transaction.title}</p>
//           <p>{transaction.price}</p>
//           <p>{transaction.description}</p>
//         </div>
//       )) }
//       {loading && <p>Cargando...</p>}
//       {transactions.length === 0 && <p>No hay transacciones recientes</p>}

//     </>
//   )
// }
