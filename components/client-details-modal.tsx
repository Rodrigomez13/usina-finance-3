"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getClientTransactions, getClientAdminExpenses } from "@/lib/api"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ClientDetailsModalProps {
  clientId: number
  clientName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  dateRange?: {
    from: Date
    to: Date
  }
}

export function ClientDetailsModal({ clientId, clientName, open, onOpenChange, dateRange }: ClientDetailsModalProps) {
  const [transactions, setTransactions] = useState<any[]>([])
  const [adminExpenses, setAdminExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchClientDetails() {
      if (!open) return

      setLoading(true)
      setError(null)

      try {
        const from = dateRange?.from || new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        const to = dateRange?.to || new Date()

        // Obtener transacciones del cliente
        const txData = await getClientTransactions(clientId, from, to)
        setTransactions(txData || [])

        // Obtener gastos administrativos del cliente
        const expData = await getClientAdminExpenses(clientId, from, to)
        setAdminExpenses(expData || [])
      } catch (error: any) {
        console.error("Error al cargar detalles del cliente:", error)
        setError(`Error al cargar datos: ${error.message || "Error desconocido"}`)
      } finally {
        setLoading(false)
      }
    }

    fetchClientDetails()
  }, [open, clientId, dateRange])

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: es })
  }

  // Filtrar transacciones por tipo
  const fundingTransactions = transactions.filter((tx) => tx.type === "funding")
  const expenseTransactions = transactions.filter((tx) => tx.type === "expense" && tx.category !== "admin")
  const leadTransactions = transactions.filter((tx) => tx.type === "lead")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="client-details-description">
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold text-[#0e6251]">Detalles de {clientName}</DialogTitle>
          {/* Eliminamos el botón X duplicado y dejamos solo el que viene por defecto con DialogContent */}
        </DialogHeader>

        <div id="client-details-description" className="sr-only">
          Información detallada de transacciones y gastos para {clientName}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#148f77]"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8 text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="bg-white border border-[#e8f3f1] shadow-sm">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white text-[#34495e]"
                >
                  Todas las Transacciones
                </TabsTrigger>
                <TabsTrigger
                  value="funding"
                  className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white text-[#34495e]"
                >
                  Fondeos
                </TabsTrigger>
                <TabsTrigger
                  value="expenses"
                  className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white text-[#34495e]"
                >
                  Gastos de Publicidad
                </TabsTrigger>
                <TabsTrigger
                  value="admin"
                  className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white text-[#34495e]"
                >
                  Gastos Administrativos
                </TabsTrigger>
              </TabsList>

              <div className="min-h-[400px]">
                <TabsContent value="all" className="mt-4">
                  <h3 className="text-xl font-semibold text-[#0e6251] mb-4">Todas las Transacciones</h3>
                  {transactions.length === 0 && adminExpenses.length === 0 ? (
                    <p className="text-center py-4 text-[#7f8c8d]">No hay transacciones en el período seleccionado</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table className="border-collapse">
                        <TableHeader className="bg-[#f0f9f7]">
                          <TableRow>
                            <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">Fecha</TableHead>
                            <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">Tipo</TableHead>
                            <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">Monto</TableHead>
                            <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">
                              Concepto
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {/* Transacciones regulares */}
                          {transactions.map((tx, index) => (
                            <TableRow key={`tx-${tx.id}`} className={index % 2 === 0 ? "bg-white" : "bg-[#f8fcfb]"}>
                              <TableCell className="border border-[#e8f3f1]">{formatDate(tx.date)}</TableCell>
                              <TableCell
                                className={`border border-[#e8f3f1] ${
                                  tx.type === "funding"
                                    ? "text-green-600"
                                    : tx.type === "expense"
                                      ? "text-red-600"
                                      : "text-blue-600"
                                }`}
                              >
                                {tx.type === "funding"
                                  ? "Fondeo"
                                  : tx.type === "expense"
                                    ? tx.category === "admin"
                                      ? "Gasto Administrativo"
                                      : "Gasto Publicidad"
                                    : "Leads"}
                              </TableCell>
                              <TableCell className="border border-[#e8f3f1]">
                                {tx.type === "lead" ? tx.amount : `$${tx.amount.toFixed(2)}`}
                              </TableCell>
                              <TableCell className="border border-[#e8f3f1]">{tx.notes || "-"}</TableCell>
                            </TableRow>
                          ))}

                          {/* Gastos administrativos */}
                          {adminExpenses.map((exp, index) => (
                            <TableRow key={`exp-${exp.id}`} className={index % 2 === 0 ? "bg-white" : "bg-[#f8fcfb]"}>
                              <TableCell className="border border-[#e8f3f1]">{formatDate(exp.date)}</TableCell>
                              <TableCell className="border border-[#e8f3f1] text-red-600">
                                Gasto Administrativo
                              </TableCell>
                              <TableCell className="border border-[#e8f3f1] text-red-600">
                                ${exp.amount.toFixed(2)}
                              </TableCell>
                              <TableCell className="border border-[#e8f3f1]">
                                {exp.concept} {exp.status === "pending" ? "(Pendiente)" : "(Pagado)"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="funding" className="mt-4">
                  <h3 className="text-xl font-semibold text-[#0e6251] mb-4">Fondeos</h3>
                  {fundingTransactions.length === 0 ? (
                    <p className="text-center py-4 text-[#7f8c8d]">No hay fondeos en el período seleccionado</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table className="border-collapse">
                        <TableHeader className="bg-[#f0f9f7]">
                          <TableRow>
                            <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">Fecha</TableHead>
                            <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">Monto</TableHead>
                            <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">
                              Método de Pago
                            </TableHead>
                            <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">
                              Concepto
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fundingTransactions.map((tx, index) => (
                            <TableRow key={tx.id} className={index % 2 === 0 ? "bg-white" : "bg-[#f8fcfb]"}>
                              <TableCell className="border border-[#e8f3f1]">{formatDate(tx.date)}</TableCell>
                              <TableCell className="border border-[#e8f3f1] text-green-600">
                                ${tx.amount.toFixed(2)}
                              </TableCell>
                              <TableCell className="border border-[#e8f3f1]">
                                {tx.payment_method === "transfer"
                                  ? "Transferencia"
                                  : tx.payment_method === "crypto"
                                    ? "Criptomoneda"
                                    : tx.payment_method === "cash"
                                      ? "Efectivo"
                                      : "Otro"}
                              </TableCell>
                              <TableCell className="border border-[#e8f3f1]">{tx.notes || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="expenses" className="mt-4">
                  <h3 className="text-xl font-semibold text-[#0e6251] mb-4">Gastos de Publicidad</h3>
                  {expenseTransactions.length === 0 ? (
                    <p className="text-center py-4 text-[#7f8c8d]">
                      No hay gastos de publicidad en el período seleccionado
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table className="border-collapse">
                        <TableHeader className="bg-[#f0f9f7]">
                          <TableRow>
                            <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">Fecha</TableHead>
                            <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">Monto</TableHead>
                            <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">Leads</TableHead>
                            <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">
                              Costo por Lead
                            </TableHead>
                            <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">
                              Concepto
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {expenseTransactions.map((tx, index) => (
                            <TableRow key={tx.id} className={index % 2 === 0 ? "bg-white" : "bg-[#f8fcfb]"}>
                              <TableCell className="border border-[#e8f3f1]">{formatDate(tx.date)}</TableCell>
                              <TableCell className="border border-[#e8f3f1] text-red-600">
                                ${tx.amount.toFixed(2)}
                              </TableCell>
                              <TableCell className="border border-[#e8f3f1]">
                                {leadTransactions.find(
                                  (lead) => new Date(lead.date).toDateString() === new Date(tx.date).toDateString(),
                                )?.amount || 0}
                              </TableCell>
                              <TableCell className="border border-[#e8f3f1]">
                                ${tx.cost_per_lead?.toFixed(2) || "N/A"}
                              </TableCell>
                              <TableCell className="border border-[#e8f3f1]">{tx.notes || "-"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="admin" className="mt-4">
                  <h3 className="text-xl font-semibold text-[#0e6251] mb-4">Gastos Administrativos</h3>
                  {adminExpenses.length === 0 ? (
                    <p className="text-center py-4 text-[#7f8c8d]">
                      No hay gastos administrativos en el período seleccionado
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table className="border-collapse">
                        <TableHeader className="bg-[#f0f9f7]">
                          <TableRow>
                            <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">Fecha</TableHead>
                            <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">
                              Concepto
                            </TableHead>
                            <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">Monto</TableHead>
                            <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">Estado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {adminExpenses.map((exp, index) => (
                            <TableRow key={exp.id} className={index % 2 === 0 ? "bg-white" : "bg-[#f8fcfb]"}>
                              <TableCell className="border border-[#e8f3f1]">{formatDate(exp.date)}</TableCell>
                              <TableCell className="border border-[#e8f3f1]">{exp.concept}</TableCell>
                              <TableCell className="border border-[#e8f3f1] text-red-600">
                                ${exp.amount.toFixed(2)}
                              </TableCell>
                              <TableCell className="border border-[#e8f3f1]">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    exp.status === "paid"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {exp.status === "paid" ? "Pagado" : "Pendiente"}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
