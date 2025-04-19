"use client"

import { useEffect, useState } from "react"
import { getAdminExpenses, updateExpenseStatus, updateExpenseDistributionStatus } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PlusCircle, Check, Filter, CheckSquare, ChevronDown, ChevronUp } from "lucide-react"
import type { AdminExpense, ExpenseDistribution } from "@/types/index"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface AdminExpensesProps {
  isV0?: boolean
  dateRange?: {
    from?: Date
    to?: Date
  }
}

export function AdminExpenses({ isV0 = false, dateRange }: AdminExpensesProps) {
  const [expenses, setExpenses] = useState<AdminExpense[]>([])
  const [filteredExpenses, setFilteredExpenses] = useState<AdminExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "paid">("all")
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)
  const [selectedDistributions, setSelectedDistributions] = useState<Record<number, boolean>>({})
  const [expandedExpenses, setExpandedExpenses] = useState<Record<number, boolean>>({})
  const { toast } = useToast()

  useEffect(() => {
    async function fetchExpenses() {
      try {
        setLoading(true)

        // Si estamos en v0, usar datos de demostración
        if (isV0) {
          console.log("Usando gastos administrativos de demostración para v0")
          setTimeout(() => {
            // Usar los datos de demostración existentes
            const demoData = [
              /* ... datos de demostración ... */
            ]
            setExpenses(demoData)
            setFilteredExpenses(demoData)
            setLoading(false)
          }, 500) // Simular carga
          return
        }

        let data = await getAdminExpenses()

        // Filtrar por rango de fechas si está disponible
        if (dateRange && dateRange.from && dateRange.to) {
          const fromDate = dateRange.from.toISOString()
          const toDate = dateRange.to.toISOString()

          data = data.filter((expense) => {
            const expenseDate = new Date(expense.date).toISOString()
            return expenseDate >= fromDate && expenseDate <= toDate
          })
        }

        // Inicializar el estado de expansión para cada gasto
        const initialExpandState: Record<number, boolean> = {}
        data.forEach((expense) => {
          initialExpandState[expense.id] = false
        })
        setExpandedExpenses(initialExpandState)

        setExpenses(data || [])
        setFilteredExpenses(data || [])
      } catch (error) {
        console.error("Error al cargar gastos administrativos:", error)
        setExpenses([])
        setFilteredExpenses([])
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
  }, [isV0, dateRange])

  // Aplicar filtro de estado
  useEffect(() => {
    if (statusFilter === "all") {
      setFilteredExpenses(expenses)
    } else {
      setFilteredExpenses(expenses.filter((expense) => expense.status === statusFilter))
    }
  }, [statusFilter, expenses])

  const handleConfirmPayment = async (expenseId: number) => {
    try {
      setUpdatingStatus(expenseId)

      // Si estamos en v0, simular actualización
      if (isV0) {
        setTimeout(() => {
          const updatedExpenses = expenses.map((expense) =>
            expense.id === expenseId
              ? {
                  ...expense,
                  status: "paid" as const,
                  expense_distributions: expense.expense_distributions?.map((dist) => ({
                    ...dist,
                    status: "paid" as const,
                  })),
                }
              : expense,
          )
          setExpenses(updatedExpenses)
          setFilteredExpenses(updatedExpenses.filter((exp) => statusFilter === "all" || exp.status === statusFilter))
          setUpdatingStatus(null)

          toast({
            title: "Pago confirmado",
            description: "El estado del gasto ha sido actualizado a 'Pagado'",
          })
        }, 500)
        return
      }

      // Actualizar estado en la base de datos
      await updateExpenseStatus(expenseId, "paid")

      // También actualizar todas las distribuciones a pagado
      const expense = expenses.find((e) => e.id === expenseId)
      if (expense && expense.expense_distributions) {
        for (const dist of expense.expense_distributions) {
          await updateExpenseDistributionStatus(dist.id, "paid")
        }
      }

      // Actualizar estado local
      const updatedExpenses = expenses.map((expense) =>
        expense.id === expenseId
          ? {
              ...expense,
              status: "paid" as const,
              expense_distributions: expense.expense_distributions?.map((dist) => ({
                ...dist,
                status: "paid" as const,
              })),
            }
          : expense,
      )

      setExpenses(updatedExpenses)
      setFilteredExpenses(updatedExpenses.filter((exp) => statusFilter === "all" || exp.status === statusFilter))
      setSelectedDistributions({}) // Limpiar selecciones

      toast({
        title: "Pago confirmado",
        description: "El estado del gasto y todas sus distribuciones han sido actualizados a 'Pagado'",
      })
    } catch (error) {
      console.error("Error al confirmar pago:", error)
      toast({
        title: "Error",
        description: "No se pudo confirmar el pago. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleToggleDistribution = (distributionId: number) => {
    setSelectedDistributions((prev) => ({
      ...prev,
      [distributionId]: !prev[distributionId],
    }))
  }

  const handleConfirmSelectedPayments = async (expenseId: number) => {
    try {
      setUpdatingStatus(expenseId)

      // Obtener el gasto actual
      const currentExpense = expenses.find((exp) => exp.id === expenseId)
      if (!currentExpense || !currentExpense.expense_distributions) {
        throw new Error("No se encontró el gasto o sus distribuciones")
      }

      // Identificar qué distribuciones están seleccionadas
      const selectedIds = Object.entries(selectedDistributions)
        .filter(([_, isSelected]) => isSelected)
        .map(([id]) => Number.parseInt(id))

      if (selectedIds.length === 0) {
        toast({
          title: "Advertencia",
          description: "No hay pagos seleccionados para confirmar",
          variant: "default",
        })
        setUpdatingStatus(null)
        return
      }

      // Si estamos en v0, simular actualización
      if (isV0) {
        setTimeout(() => {
          // Actualizar solo las distribuciones seleccionadas
          const updatedExpenses = expenses.map((expense) => {
            if (expense.id === expenseId) {
              const updatedDistributions = expense.expense_distributions?.map((dist) => {
                if (selectedIds.includes(dist.id)) {
                  return { ...dist, status: "paid" as const }
                }
                return dist
              })

              // Verificar si todas las distribuciones están pagadas
              const allPaid = updatedDistributions?.every((dist) => dist.status === "paid")

              return {
                ...expense,
                status: allPaid ? ("paid" as const) : ("pending" as const),
                expense_distributions: updatedDistributions,
              }
            }
            return expense
          })

          setExpenses(updatedExpenses)
          setFilteredExpenses(updatedExpenses.filter((exp) => statusFilter === "all" || exp.status === statusFilter))
          setSelectedDistributions({})
          setUpdatingStatus(null)

          toast({
            title: "Pagos confirmados",
            description: `Se han confirmado ${selectedIds.length} pagos seleccionados`,
          })
        }, 500)
        return
      }

      // Actualizar cada distribución seleccionada en la base de datos
      for (const distId of selectedIds) {
        await updateExpenseDistributionStatus(distId, "paid")
      }

      // Verificar si todas las distribuciones están pagadas
      const allDistributions = currentExpense.expense_distributions || []
      const updatedDistributions = allDistributions.map((dist) =>
        selectedIds.includes(dist.id) ? { ...dist, status: "paid" as const } : dist,
      )
      const allPaid = updatedDistributions.every((dist) => dist.status === "paid")

      // Si todas están pagadas, actualizar también el estado del gasto principal
      if (allPaid) {
        await updateExpenseStatus(expenseId, "paid")
      }

      // Actualizar estado local
      const updatedExpenses = expenses.map((expense) => {
        if (expense.id === expenseId) {
          const updatedDistributions = expense.expense_distributions?.map((dist) => {
            if (selectedIds.includes(dist.id)) {
              return { ...dist, status: "paid" as const }
            }
            return dist
          })

          return {
            ...expense,
            status: allPaid ? ("paid" as const) : ("pending" as const),
            expense_distributions: updatedDistributions,
          }
        }
        return expense
      })

      setExpenses(updatedExpenses)
      setFilteredExpenses(updatedExpenses.filter((exp) => statusFilter === "all" || exp.status === statusFilter))
      setSelectedDistributions({})

      toast({
        title: "Pagos confirmados",
        description: `Se han confirmado ${selectedIds.length} pagos seleccionados`,
      })
    } catch (error) {
      console.error("Error al confirmar pagos seleccionados:", error)
      toast({
        title: "Error",
        description: "No se pudieron confirmar los pagos seleccionados. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const areAllDistributionsSelected = (distributions: ExpenseDistribution[] = []) => {
    const pendingDistributions = distributions.filter((d) => d.status === "pending")
    if (pendingDistributions.length === 0) return false
    return pendingDistributions.every((dist) => selectedDistributions[dist.id])
  }

  const handleSelectAllDistributions = (expenseId: number, select: boolean) => {
    const expense = expenses.find((exp) => exp.id === expenseId)
    if (!expense || !expense.expense_distributions) return

    const newSelectedDistributions = { ...selectedDistributions }

    expense.expense_distributions.forEach((dist) => {
      if (dist.status === "pending") {
        newSelectedDistributions[dist.id] = select
      }
    })

    setSelectedDistributions(newSelectedDistributions)
  }

  const toggleExpand = (expenseId: number) => {
    setExpandedExpenses((prev) => ({
      ...prev,
      [expenseId]: !prev[expenseId],
    }))
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="bg-gray-50 animate-pulse">
            <CardHeader className="h-16"></CardHeader>
            <CardContent className="h-48"></CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | "pending" | "paid")}>
            <SelectTrigger className="w-[180px] dark:bg-finance-900 dark:border-finance-800 dark:text-white">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent className="dark:bg-finance-900 dark:border-finance-800">
              <SelectItem value="all" className="dark:text-lilac-200 dark:focus:bg-finance-800">
                Todos
              </SelectItem>
              <SelectItem value="pending" className="dark:text-lilac-200 dark:focus:bg-finance-800">
                Pendientes
              </SelectItem>
              <SelectItem value="paid" className="dark:text-lilac-200 dark:focus:bg-finance-800">
                Pagados
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Link href="/admin-expenses/new">
          <Button className="bg-[#148f77] hover:bg-[#0e6251] text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Gasto Administrativo
          </Button>
        </Link>
      </div>

      {filteredExpenses.length === 0 ? (
        <Card className="bg-white border border-[#e8f3f1] shadow-sm">
          <CardContent className="p-8 text-center text-[#7f8c8d]">
            <p>
              No hay gastos administrativos{" "}
              {statusFilter !== "all" ? `con estado "${statusFilter === "pending" ? "pendiente" : "pagado"}"` : ""}
            </p>
          </CardContent>
        </Card>
      ) : (
        filteredExpenses.map((expense) => (
          <Card key={expense.id} className="bg-white border border-[#e8f3f1] shadow-sm">
            <Collapsible open={expandedExpenses[expense.id]}>
              <CardHeader className="border-b border-[#e8f3f1]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CollapsibleTrigger
                      onClick={() => toggleExpand(expense.id)}
                      className="p-1 rounded-md hover:bg-gray-100"
                    >
                      {expandedExpenses[expense.id] ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </CollapsibleTrigger>
                    <CardTitle className="text-[#0e6251]">{expense.concept}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        expense.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {expense.status === "paid" ? "Pagado" : "Pendiente"}
                    </Badge>

                    {expense.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfirmPayment(expense.id)}
                          disabled={updatingStatus === expense.id}
                          className="border-green-200 text-green-700 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          {updatingStatus === expense.id ? "Confirmando..." : "Confirmar Todo"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConfirmSelectedPayments(expense.id)}
                          disabled={updatingStatus === expense.id}
                          className="border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <CheckSquare className="h-4 w-4 mr-1" />
                          Confirmar Seleccionados
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-sm text-[#7f8c8d]">
                  <span>Fecha: {new Date(expense.date).toLocaleDateString("es-ES")}</span>
                  <span>Total: ${expense.amount.toFixed(2)}</span>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Distribución por cliente:</h4>
                    {expense.status === "pending" && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 cursor-pointer flex items-center gap-1">
                          <Checkbox
                            checked={areAllDistributionsSelected(
                              expense.expense_distributions?.filter((d) => d.status === "pending"),
                            )}
                            onCheckedChange={(checked) => handleSelectAllDistributions(expense.id, !!checked)}
                          />
                          Seleccionar todos
                        </label>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {expense.expense_distributions &&
                      expense.expense_distributions.map((dist) => (
                        <div key={dist.id} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {expense.status === "pending" && dist.status === "pending" && (
                              <Checkbox
                                checked={!!selectedDistributions[dist.id]}
                                onCheckedChange={() => handleToggleDistribution(dist.id)}
                              />
                            )}
                            <span className="font-medium">{dist.clients?.name}</span>
                            <span className="text-sm text-[#7f8c8d] ml-2">({dist.percentage.toFixed(2)}%)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span>${dist.amount.toFixed(2)}</span>
                            <Badge
                              className={
                                dist.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {dist.status === "paid" ? "Pagado" : "Pendiente"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))
      )}
    </div>
  )
}
