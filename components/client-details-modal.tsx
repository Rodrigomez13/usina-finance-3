"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { getClientTransactions, getClientAdminExpenses } from "@/lib/api"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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

  // Función para formatear el tipo de transacción
  const formatTransactionType = (type: string) => {
    switch (type) {
      case "funding":
        return "Fondeo"
      case "expense":
        return "Gasto"
      case "lead":
        return "Leads"
      default:
        return type
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0e6251] flex justify-between items-center">
            <span>Detalles de {clientName}</span>
            <DialogClose asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" aria-label="Cerrar">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogTitle>
        </DialogHeader>

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
            <div>
              <h3 className="text-xl font-semibold text-[#0e6251] mb-4">Transacciones</h3>
              {transactions.length === 0 ? (
                <p className="text-center py-4 text-[#7f8c8d]">No hay transacciones en el período seleccionado</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="border-collapse">
                    <TableHeader className="bg-[#f0f9f7]">
                      <TableRow>
                        <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">Fecha</TableHead>
                        <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">Tipo</TableHead>
                        <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">Monto</TableHead>
                        <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">Notas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx, index) => (
                        <TableRow key={tx.id} className={index % 2 === 0 ? "bg-white" : "bg-[#f8fcfb]"}>
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
                            {formatTransactionType(tx.type)}
                          </TableCell>
                          <TableCell className="border border-[#e8f3f1]">
                            {tx.type === "lead" ? tx.amount : `$${tx.amount.toFixed(2)}`}
                          </TableCell>
                          <TableCell className="border border-[#e8f3f1]">{tx.notes || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <div>
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
                        <TableHead className="border border-[#e8f3f1] font-medium text-[#0e6251]">Concepto</TableHead>
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
                                exp.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
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
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
