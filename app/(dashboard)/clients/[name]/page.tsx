"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CalendarDateRangePicker } from "@/components/date-range-picker"
import { getClientTransactions, getClientAdminExpenses } from "@/lib/api"
import type { DateRange } from "react-day-picker"

interface Transaction {
  id: number
  date: string
  type: string
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
  status: string
  percentage: number
}

export default function ClientRecordsPage() {
  const params = useParams()
  const router = useRouter()
  const clientName = decodeURIComponent(params.name as string)

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [adminExpenses, setAdminExpenses] = useState<AdminExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
  })

  useEffect(() => {
    async function fetchClientData() {
      if (!clientName || !dateRange?.from || !dateRange?.to) return

      try {
        setLoading(true)
        const [txData, expData] = await Promise.all([
          getClientTransactions(clientName, dateRange.from, dateRange.to),
          getClientAdminExpenses(clientName, dateRange.from, dateRange.to),
        ])

        setTransactions(txData || [])
        setAdminExpenses(expData || [])
      } catch (error) {
        console.error("Error al cargar datos del cliente:", error)
        setTransactions([])
        setAdminExpenses([])
      } finally {
        setLoading(false)
      }
    }

    fetchClientData()
  }, [clientName, dateRange])

  const handleDateChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange)
  }

  // Calcular totales
  const totalLeads = transactions.filter((tx) => tx.type === "lead").reduce((sum, tx) => sum + tx.amount, 0)
  const totalExpenses = transactions.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0)
  const totalFunding = transactions.filter((tx) => tx.type === "funding").reduce((sum, tx) => sum + tx.amount, 0)
  const totalAdminExpenses = adminExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const balance = totalFunding - totalExpenses - totalAdminExpenses

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
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker onDateChange={handleDateChange} />
          <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0" onClick={() => router.back()}>
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="bg-white border border-[#e8f3f1] shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#34495e]">Total de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold text-[#148f77]">{totalLeads}</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white border border-[#e8f3f1] shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#34495e]">Gastos Directos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold text-[#148f77]">${totalExpenses.toFixed(2)}</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white border border-[#e8f3f1] shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#34495e]">Gastos Administrativos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className="text-2xl font-bold text-[#148f77]">${totalAdminExpenses.toFixed(2)}</div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-white border border-[#e8f3f1] shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#34495e]">Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <div className={`text-2xl font-bold ${balance >= 0 ? "text-[#148f77]" : "text-[#e74c3c]"}`}>
                ${balance.toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>
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
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                          No hay transacciones en el período seleccionado
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
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
                      ))
                    )}
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
                    {adminExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                          No hay gastos administrativos en el período seleccionado
                        </td>
                      </tr>
                    ) : (
                      adminExpenses.map((expense) => (
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
                      ))
                    )}
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
