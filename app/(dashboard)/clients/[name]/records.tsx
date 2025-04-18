"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Transaction {
  id: number
  date: string
  type: "funding" | "expense" | "lead"
  amount: number
  notes: string | null
  payment_method?: string | null
  category?: string | null
}

interface AdminExpense {
  id: number
  date: string
  concept: string
  amount: number
  status: "pending" | "paid"
  percentage: number
}

export default function ClientRecordsPage() {
  const params = useParams()
  const router = useRouter()
  const clientName = decodeURIComponent(params.name as string)

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [adminExpenses, setAdminExpenses] = useState<AdminExpense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchClientData() {
      try {
        setLoading(true)

        // En un entorno real, estas funciones obtendrían datos de la API
        // Para v0, usaremos datos de demostración

        // Datos de demostración para transacciones
        const demoTransactions = [
          {
            id: 1,
            date: "2025-04-13",
            type: "expense" as const,
            amount: 100,
            notes: "Compra Landing Page's",
          },
          {
            id: 2,
            date: "2025-04-13",
            type: "funding" as const,
            amount: 5000,
            notes: "Fondeo Jordan",
          },
          {
            id: 3,
            date: "2025-04-12",
            type: "lead" as const,
            amount: 127,
            notes: "Se obtuvieron del server 4",
          },
          {
            id: 4,
            date: "2025-04-12",
            type: "expense" as const,
            amount: 1369.06,
            notes: "Gasto de publicidad generado automáticamente para 127 leads",
          },
        ]

        // Datos de demostración para gastos administrativos
        const demoAdminExpenses = [
          {
            id: 1,
            date: "2025-03-21",
            concept: "Pago suscripción avica",
            amount: 41.65,
            status: "paid" as const,
            percentage: 16.67,
          },
          {
            id: 2,
            date: "2025-04-12",
            concept: "Compra de apis",
            amount: 83.35,
            status: "paid" as const,
            percentage: 16.67,
          },
        ]

        setTransactions(demoTransactions)
        setAdminExpenses(demoAdminExpenses)
      } catch (error) {
        console.error("Error al cargar datos del cliente:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClientData()
  }, [clientName])

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            className="mr-4 border-[#a2d9ce] text-[#148f77]"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold text-[#0e6251]">Detalles de {clientName}</h1>
        </div>
        <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0" onClick={() => router.back()}>
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#148f77]"></div>
        </div>
      ) : (
        <div className="space-y-8">
          <Card className="bg-white border border-[#e8f3f1] shadow-sm">
            <CardHeader className="border-b border-[#e8f3f1]">
              <CardTitle className="text-[#0e6251]">Transacciones</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f8fcfb]">
                      <th className="px-4 py-3 text-left text-sm font-medium text-[#34495e]">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[#34495e]">Tipo</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[#34495e]">Monto</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[#34495e]">Notas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-t border-[#e8f3f1]">
                        <td className="px-4 py-3 text-sm text-[#2c3e50]">
                          {new Date(tx.date).toLocaleDateString("es-ES")}
                        </td>
                        <td className="px-4 py-3 text-sm">
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
                        </td>
                        <td className="px-4 py-3 text-sm text-[#2c3e50]">
                          {tx.type === "lead" ? tx.amount : `$${tx.amount.toFixed(2)}`}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#2c3e50]">{tx.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-[#e8f3f1] shadow-sm">
            <CardHeader className="border-b border-[#e8f3f1]">
              <CardTitle className="text-[#0e6251]">Gastos Administrativos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f8fcfb]">
                      <th className="px-4 py-3 text-left text-sm font-medium text-[#34495e]">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[#34495e]">Concepto</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[#34495e]">Monto</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-[#34495e]">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminExpenses.map((expense) => (
                      <tr key={expense.id} className="border-t border-[#e8f3f1]">
                        <td className="px-4 py-3 text-sm text-[#2c3e50]">
                          {new Date(expense.date).toLocaleDateString("es-ES")}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#2c3e50]">{expense.concept}</td>
                        <td className="px-4 py-3 text-sm text-[#2c3e50]">${expense.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">
                          <Badge
                            className={
                              expense.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {expense.status === "paid" ? "Pagado" : "Pendiente"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
