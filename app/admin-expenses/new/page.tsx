"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { createAdminExpense } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { getClients } from "@/lib/api"

export default function NewAdminExpensePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [formData, setFormData] = useState({
    concept: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paid_by: "shared",
    status: "pending",
  })
  const [distributions, setDistributions] = useState<any[]>([])
  const [totalPercentage, setTotalPercentage] = useState(0)
  const [totalDistributed, setTotalDistributed] = useState(0)

  useEffect(() => {
    async function loadClients() {
      try {
        const clientsData = await getClients()
        setClients(clientsData)

        // Inicializar distribuciones con todos los clientes
        if (clientsData.length > 0) {
          const initialDistributions = clientsData.map((client) => ({
            client_id: client.id,
            client_name: client.name,
            percentage: 0,
            amount: 0,
            status: "pending",
          }))
          setDistributions(initialDistributions)
        }
      } catch (error) {
        console.error("Error al cargar clientes:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes",
          variant: "destructive",
        })
      }
    }

    loadClients()
  }, [toast])

  // Actualizar montos cuando cambia el porcentaje o el monto total
  useEffect(() => {
    if (formData.amount) {
      const totalAmount = Number.parseFloat(formData.amount)
      const updatedDistributions = distributions.map((dist) => ({
        ...dist,
        amount: (dist.percentage / 100) * totalAmount,
      }))
      setDistributions(updatedDistributions)

      // Calcular totales
      const newTotalPercentage = updatedDistributions.reduce((sum, dist) => sum + dist.percentage, 0)
      const newTotalDistributed = updatedDistributions.reduce((sum, dist) => sum + dist.amount, 0)

      setTotalPercentage(newTotalPercentage)
      setTotalDistributed(newTotalDistributed)
    }
  }, [formData.amount, distributions.map((d) => d.percentage).join(",")])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleDistributionChange = (clientId: number, field: string, value: number) => {
    const updatedDistributions = distributions.map((dist) => {
      if (dist.client_id === clientId) {
        if (field === "percentage") {
          // Si cambia el porcentaje, recalcular el monto
          const amount = formData.amount ? (value / 100) * Number.parseFloat(formData.amount) : 0
          return { ...dist, percentage: value, amount }
        } else if (field === "amount") {
          // Si cambia el monto, recalcular el porcentaje
          const percentage =
            formData.amount && Number.parseFloat(formData.amount) > 0
              ? (value / Number.parseFloat(formData.amount)) * 100
              : 0
          return { ...dist, amount: value, percentage }
        }
      }
      return dist
    })

    setDistributions(updatedDistributions)
  }

  const distributeEvenly = () => {
    if (clients.length === 0 || !formData.amount) return

    const evenPercentage = 100 / clients.length
    const evenAmount = Number.parseFloat(formData.amount) / clients.length

    const updatedDistributions = distributions.map((dist) => ({
      ...dist,
      percentage: evenPercentage,
      amount: evenAmount,
    }))

    setDistributions(updatedDistributions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validar datos
      if (!formData.concept || !formData.amount || !formData.date) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos requeridos",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Validar que la suma de porcentajes sea 100%
      if (Math.abs(totalPercentage - 100) > 0.01) {
        toast({
          title: "Error",
          description: "La suma de los porcentajes debe ser 100%",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Preparar datos para guardar
      const expense = {
        concept: formData.concept,
        amount: Number.parseFloat(formData.amount),
        date: formData.date,
        paid_by: formData.paid_by,
        status: formData.status,
        created_by: "sistema", // Esto debería venir del contexto de autenticación
      }

      // Filtrar distribuciones con porcentaje > 0
      const activeDistributions = distributions
        .filter((dist) => dist.percentage > 0)
        .map((dist) => ({
          client_id: dist.client_id,
          percentage: dist.percentage,
          amount: dist.amount,
          status: formData.status, // Usar el mismo estado que el gasto principal
        }))

      if (activeDistributions.length === 0) {
        toast({
          title: "Error",
          description: "Debe asignar al menos un porcentaje a un cliente",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Guardar gasto administrativo
      await createAdminExpense(expense, activeDistributions)

      toast({
        title: "Gasto guardado",
        description: "El gasto administrativo se ha registrado correctamente",
      })

      // Redirigir a la página de gastos administrativos
      router.push("/dashboard?tab=expenses")
    } catch (error) {
      console.error("Error al guardar el gasto administrativo:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el gasto administrativo. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href="/dashboard?tab=expenses">
          <Button variant="outline" size="sm" className="mr-4 border-[#a2d9ce] text-[#148f77]">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Gastos Administrativos
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-[#0e6251]">Nuevo Gasto Administrativo</h1>
      </div>

      <Card className="max-w-4xl mx-auto border-[#a2d9ce]">
        <form onSubmit={handleSubmit}>
          <CardHeader className="bg-[#f0f9f7] border-b border-[#e8f3f1]">
            <CardTitle className="text-[#0e6251]">Detalles del Gasto</CardTitle>
            <CardDescription className="text-[#7f8c8d]">
              Ingrese la información del gasto administrativo y cómo se distribuirá entre los clientes
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="concept" className="text-[#34495e]">
                  Concepto <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="concept"
                  value={formData.concept}
                  onChange={handleChange}
                  placeholder="Ej: Alquiler de oficina"
                  className="border-[#a2d9ce] focus:border-[#148f77] focus:ring-[#45b39d]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-[#34495e]">
                  Monto Total <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Ej: 1000.00"
                  className="border-[#a2d9ce] focus:border-[#148f77] focus:ring-[#45b39d]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-[#34495e]">
                  Fecha <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="border-[#a2d9ce] focus:border-[#148f77] focus:ring-[#45b39d]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-[#34495e]">
                  Estado
                </Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full p-2 border rounded-md border-[#a2d9ce] focus:border-[#148f77] focus:ring-[#45b39d]"
                >
                  <option value="pending">Pendiente</option>
                  <option value="paid">Pagado</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paid_by" className="text-[#34495e]">
                Pagado por
              </Label>
              <select
                id="paid_by"
                value={formData.paid_by}
                onChange={(e) => setFormData((prev) => ({ ...prev, paid_by: e.target.value }))}
                className="w-full p-2 border rounded-md border-[#a2d9ce] focus:border-[#148f77] focus:ring-[#45b39d]"
              >
                <option value="shared">Compartido</option>
                <option value="company">Empresa</option>
              </select>
            </div>

            <div className="pt-4 border-t border-[#e8f3f1]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-[#0e6251]">Distribución por Cliente</h3>
                <Button
                  type="button"
                  onClick={distributeEvenly}
                  variant="outline"
                  className="border-[#a2d9ce] text-[#148f77] hover:bg-[#f0f9f7]"
                >
                  Distribuir Equitativamente
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#f0f9f7]">
                      <th className="border border-[#e8f3f1] px-4 py-2 text-left text-[#0e6251]">Cliente</th>
                      <th className="border border-[#e8f3f1] px-4 py-2 text-left text-[#0e6251]">Porcentaje (%)</th>
                      <th className="border border-[#e8f3f1] px-4 py-2 text-left text-[#0e6251]">Monto ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {distributions.map((dist, index) => (
                      <tr key={dist.client_id} className={index % 2 === 0 ? "bg-white" : "bg-[#f8fcfb]"}>
                        <td className="border border-[#e8f3f1] px-4 py-2">{dist.client_name}</td>
                        <td className="border border-[#e8f3f1] px-4 py-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={dist.percentage}
                            onChange={(e) =>
                              handleDistributionChange(
                                dist.client_id,
                                "percentage",
                                Number.parseFloat(e.target.value) || 0,
                              )
                            }
                            className="border-[#a2d9ce] focus:border-[#148f77] focus:ring-[#45b39d]"
                          />
                        </td>
                        <td className="border border-[#e8f3f1] px-4 py-2">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={dist.amount.toFixed(2)}
                            onChange={(e) =>
                              handleDistributionChange(dist.client_id, "amount", Number.parseFloat(e.target.value) || 0)
                            }
                            className="border-[#a2d9ce] focus:border-[#148f77] focus:ring-[#45b39d]"
                          />
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[#f0f9f7] font-medium">
                      <td className="border border-[#e8f3f1] px-4 py-2">Total</td>
                      <td
                        className={`border border-[#e8f3f1] px-4 py-2 ${Math.abs(totalPercentage - 100) > 0.01 ? "text-red-600" : "text-[#148f77]"}`}
                      >
                        {totalPercentage.toFixed(2)}%
                        {Math.abs(totalPercentage - 100) > 0.01 && (
                          <span className="ml-2 text-xs text-red-600">
                            {totalPercentage < 100
                              ? `(Faltan ${(100 - totalPercentage).toFixed(2)}%)`
                              : `(Sobran ${(totalPercentage - 100).toFixed(2)}%)`}
                          </span>
                        )}
                      </td>
                      <td
                        className={`border border-[#e8f3f1] px-4 py-2 ${Math.abs(totalDistributed - Number.parseFloat(formData.amount || "0")) > 0.01 ? "text-red-600" : "text-[#148f77]"}`}
                      >
                        ${totalDistributed.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-[#e8f3f1] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard?tab=expenses")}
              className="border-[#a2d9ce] text-[#148f77] hover:bg-[#f0f9f7]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || Math.abs(totalPercentage - 100) > 0.01}
              className="bg-[#148f77] hover:bg-[#0e6251] text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Guardando..." : "Guardar Gasto"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
