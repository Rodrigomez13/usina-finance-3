"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createTransaction } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { getSupabaseClient } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { apiCache } from "@/lib/cache"

interface Client {
  id: number
  name: string
}

interface FormData {
  client_id: string
  date: string
  amount: string
  notes: string
  payment_method: string
  cost_per_lead: string
}

export default function NewTransactionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [transactionType, setTransactionType] = useState("funding")
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [calculatedAmount, setCalculatedAmount] = useState<number | null>(null)
  const [formData, setFormData] = useState<FormData>({
    client_id: "",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    notes: "",
    payment_method: "transfer",
    cost_per_lead: "",
  })

  useEffect(() => {
    async function loadClients() {
      const supabase = getSupabaseClient()
      if (!supabase) {
        console.error("No se pudo inicializar el cliente de Supabase")
        return
      }

      const { data } = await supabase.from("clients").select("id, name").order("name")
      if (data) {
        setClients(data)
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, client_id: data[0].id.toString() }))
        }
      }
    }

    loadClients()
  }, [])

  // Calcular el monto total cuando cambia la cantidad de leads o el costo por lead
  useEffect(() => {
    if (transactionType === "lead" && formData.amount && formData.cost_per_lead) {
      const leads = Number.parseFloat(formData.amount)
      const costPerLead = Number.parseFloat(formData.cost_per_lead)

      if (!isNaN(leads) && !isNaN(costPerLead)) {
        const total = leads * costPerLead
        setCalculatedAmount(total)
      } else {
        setCalculatedAmount(null)
      }
    } else {
      setCalculatedAmount(null)
    }
  }, [transactionType, formData.amount, formData.cost_per_lead])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar datos
      if (!formData.client_id || !formData.date || !formData.amount) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos requeridos",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (transactionType === "lead" && !formData.cost_per_lead) {
        toast({
          title: "Error",
          description: "Por favor ingrese el costo por lead",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Preparar datos para guardar
      const clientId = Number.parseInt(formData.client_id)
      const leads = transactionType === "lead" ? Number.parseFloat(formData.amount) : 0
      const costPerLead = transactionType === "lead" ? Number.parseFloat(formData.cost_per_lead) : null
      const expenseAmount = calculatedAmount || 0

      // Si es un registro de leads, crear dos transacciones: una para los leads y otra para el gasto
      if (transactionType === "lead") {
        // Transacción de leads
        const leadTransaction = {
          client_id: clientId,
          type: "lead" as const,
          amount: leads,
          date: formData.date,
          notes: formData.notes || `Registro de ${leads} leads`,
          created_by: user?.email || "sistema",
        }

        // Transacción de gasto por publicidad
        const expenseTransaction = {
          client_id: clientId,
          type: "expense" as const,
          amount: expenseAmount,
          date: formData.date,
          notes: formData.notes || `Gasto por ${leads} leads`,
          payment_method: "transfer",
          category: "advertising",
          cost_per_lead: costPerLead,
          created_by: user?.email || "sistema",
        }

        // Guardar ambas transacciones
        await createTransaction(leadTransaction)
        await createTransaction(expenseTransaction)

        toast({
          title: "Transacciones guardadas",
          description: `Se han registrado ${leads} leads y un gasto de $${expenseAmount.toFixed(2)}`,
        })
      } else {
        // Para fondeo o gasto normal
        const transaction = {
          client_id: clientId,
          type: transactionType as "funding" | "expense",
          amount: Number.parseFloat(formData.amount),
          date: formData.date,
          notes: formData.notes || null,
          payment_method: formData.payment_method,
          category: transactionType === "expense" ? "advertising" : undefined,
          created_by: user?.email || "sistema",
        }

        await createTransaction(transaction)

        toast({
          title: "Transacción guardada",
          description: "La transacción se ha registrado correctamente",
        })
      }

      // Invalidar la caché para que se actualicen los datos
      apiCache.invalidatePattern(/^dashboard_stats|^client_stats|^recent_transactions/)

      router.push("/")
    } catch (error) {
      console.error("Error al guardar la transacción:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la transacción. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="mr-4 dark:border-finance-800 dark:bg-finance-900 dark:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold dark:text-white">Nueva Transacción</h1>
      </div>

      <Tabs defaultValue="funding" onValueChange={setTransactionType} className="space-y-6">
        <TabsList className="grid grid-cols-2 w-full max-w-md dark:bg-finance-900 dark:border dark:border-finance-800">
          <TabsTrigger
            value="funding"
            className="dark:data-[state=active]:bg-lilac-700 dark:data-[state=active]:text-white dark:text-lilac-200"
          >
            Fondeo
          </TabsTrigger>
          <TabsTrigger
            value="lead"
            className="dark:data-[state=active]:bg-lilac-700 dark:data-[state=active]:text-white dark:text-lilac-200"
          >
            Leads y Gastos
          </TabsTrigger>
        </TabsList>

        <Card className="max-w-2xl mx-auto dark:bg-finance-900 dark:border-finance-800">
          <form onSubmit={handleSubmit}>
            <CardHeader className="dark:border-b dark:border-finance-800">
              <CardTitle className="dark:text-white">
                {transactionType === "funding" && "Registrar Nuevo Fondeo"}
                {transactionType === "lead" && "Registrar Leads y Gastos de Publicidad"}
              </CardTitle>
              <CardDescription className="dark:text-lilac-300">
                {transactionType === "funding" && "Ingrese los detalles del fondeo recibido de un cliente"}
                {transactionType === "lead" &&
                  "Ingrese los detalles de los leads y se calculará automáticamente el gasto"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client_id" className="dark:text-lilac-200">
                    Cliente
                  </Label>
                  <Select
                    value={formData.client_id.toString()}
                    onValueChange={(value) => handleSelectChange("client_id", value)}
                  >
                    <SelectTrigger
                      id="client_id"
                      className="dark:bg-finance-900 dark:border-finance-800 dark:text-white"
                    >
                      <SelectValue placeholder="Seleccione cliente" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-finance-900 dark:border-finance-800">
                      {clients.map((client) => (
                        <SelectItem
                          key={client.id}
                          value={client.id.toString()}
                          className="dark:text-lilac-200 dark:focus:bg-finance-800"
                        >
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="dark:text-lilac-200">
                    Fecha
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="dark:bg-finance-900 dark:border-finance-800 dark:text-white"
                  />
                </div>
              </div>

              {transactionType === "funding" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="dark:text-lilac-200">
                      Monto
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="Ej: 1000.00"
                      value={formData.amount}
                      onChange={handleChange}
                      className="dark:bg-finance-900 dark:border-finance-800 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment_method" className="dark:text-lilac-200">
                      Método de Pago
                    </Label>
                    <Select
                      value={formData.payment_method}
                      onValueChange={(value) => handleSelectChange("payment_method", value)}
                    >
                      <SelectTrigger
                        id="payment_method"
                        className="dark:bg-finance-900 dark:border-finance-800 dark:text-white"
                      >
                        <SelectValue placeholder="Seleccione método" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-finance-900 dark:border-finance-800">
                        <SelectItem value="transfer" className="dark:text-lilac-200 dark:focus:bg-finance-800">
                          Transferencia Bancaria
                        </SelectItem>
                        <SelectItem value="crypto" className="dark:text-lilac-200 dark:focus:bg-finance-800">
                          Criptomoneda
                        </SelectItem>
                        <SelectItem value="cash" className="dark:text-lilac-200 dark:focus:bg-finance-800">
                          Efectivo
                        </SelectItem>
                        <SelectItem value="other" className="dark:text-lilac-200 dark:focus:bg-finance-800">
                          Otro
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="dark:text-lilac-200">
                      Cantidad de Leads
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Ej: 100"
                      value={formData.amount}
                      onChange={handleChange}
                      className="dark:bg-finance-900 dark:border-finance-800 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost_per_lead" className="dark:text-lilac-200">
                      Costo por Lead
                    </Label>
                    <Input
                      id="cost_per_lead"
                      type="number"
                      step="0.01"
                      placeholder="Ej: 10.00"
                      value={formData.cost_per_lead}
                      onChange={handleChange}
                      className="dark:bg-finance-900 dark:border-finance-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {transactionType === "lead" && calculatedAmount !== null && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Cálculo automático de gasto</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Se registrará un gasto de publicidad por <strong>${calculatedAmount.toFixed(2)}</strong> (
                      {formData.amount} leads × ${formData.cost_per_lead} por lead)
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes" className="dark:text-lilac-200">
                  Notas / Referencia
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Ingrese notas adicionales o referencias"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="dark:bg-finance-900 dark:border-finance-800 dark:text-white"
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-between dark:border-t dark:border-finance-800 pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push("/")}
                className="dark:border-finance-800 dark:bg-finance-900 dark:text-white dark:hover:bg-finance-800"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || (transactionType === "lead" && (!formData.amount || !formData.cost_per_lead))}
                className="dark:bg-lilac-700 dark:hover:bg-lilac-600 dark:text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </Tabs>
    </div>
  )
}
