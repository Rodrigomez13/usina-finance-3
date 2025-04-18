"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { createAdminExpense } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { DatePicker } from "@/components/ui/date-picker";

export default function NewAdminExpensePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<{ id: number; name: string }[]>([]);
  const [formData, setFormData] = useState({
    concept: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    paid_by: "shared",
    status: "pending" as "pending" | "paid",
  });
  const [distributions, setDistributions] = useState<
    {
      client_id: string;
      percentage: string;
      amount: string;
    }[]
  >([]);
  const [totalPercentage, setTotalPercentage] = useState(0);

  useEffect(() => {
    async function loadClients() {
      try {
        // Importar la función getClients directamente para evitar problemas de inicialización
        const { getClients } = await import("@/lib/api");
        const clientsData = await getClients();
        setClients(clientsData || []);

        // Inicializar distribuciones con todos los clientes
        if (clientsData && clientsData.length > 0) {
          const initialDistributions = clientsData.map((client) => ({
            client_id: client.id.toString(),
            percentage: "0",
            amount: "0",
          }));
          setDistributions(initialDistributions);
        }
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        toast({
          title: "Error",
          description:
            "No se pudieron cargar los clientes. Intente nuevamente.",
          variant: "destructive",
        });
      }
    }

    loadClients();
  }, [toast]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // Si cambia el monto total, actualizar los montos de distribución
    if (id === "amount" && value) {
      updateDistributionAmounts(value);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        date: date.toISOString().split("T")[0],
      }));
    }
  };

  const handleDistributionChange = (
    index: number,
    field: "client_id" | "percentage",
    value: string
  ) => {
    const newDistributions = [...distributions];
    newDistributions[index][field] = value;

    // Si cambia el porcentaje, actualizar el monto
    if (field === "percentage") {
      const totalAmount = Number.parseFloat(formData.amount) || 0;
      const percentage = Number.parseFloat(value) || 0;
      newDistributions[index].amount = (
        (totalAmount * percentage) /
        100
      ).toFixed(2);
    }

    setDistributions(newDistributions);
    calculateTotalPercentage(newDistributions);
  };

  const updateDistributionAmounts = (totalAmountStr: string) => {
    const totalAmount = Number.parseFloat(totalAmountStr) || 0;
    const newDistributions = distributions.map((dist) => {
      const percentage = Number.parseFloat(dist.percentage) || 0;
      return {
        ...dist,
        amount: ((totalAmount * percentage) / 100).toFixed(2),
      };
    });
    setDistributions(newDistributions);
  };

  const calculateTotalPercentage = (dists = distributions) => {
    const total = dists.reduce(
      (sum, dist) => sum + (Number.parseFloat(dist.percentage) || 0),
      0
    );
    setTotalPercentage(total);
    return total;
  };

  const addDistribution = () => {
    if (clients.length === 0) return;

    setDistributions((prev) => [
      ...prev,
      {
        client_id: clients[0].id.toString(),
        percentage: "0",
        amount: "0",
      },
    ]);
  };

  const removeDistribution = (index: number) => {
    const newDistributions = distributions.filter((_, i) => i !== index);
    setDistributions(newDistributions);
    calculateTotalPercentage(newDistributions);
  };

  const distributeEvenly = () => {
    if (distributions.length === 0) return;

    const evenPercentage = (100 / distributions.length).toFixed(2);
    const totalAmount = Number.parseFloat(formData.amount) || 0;
    const evenAmount = (totalAmount / distributions.length).toFixed(2);

    const newDistributions = distributions.map((dist) => ({
      ...dist,
      percentage: evenPercentage,
      amount: evenAmount,
    }));

    setDistributions(newDistributions);
    calculateTotalPercentage(newDistributions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar datos
      if (!formData.concept || !formData.amount || !formData.date) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos requeridos",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validar que el total de porcentajes sea 100%
      const totalPercent = calculateTotalPercentage();
      if (totalPercent !== 100) {
        toast({
          title: "Error",
          description: `La suma de porcentajes debe ser 100%. Actualmente es ${totalPercent}%`,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Preparar datos para guardar
      const expense = {
        concept: formData.concept,
        amount: Number.parseFloat(formData.amount),
        date: formData.date,
        paid_by: formData.paid_by,
        status: formData.status,
        created_by: user?.email || "sistema",
      };

      // Preparar distribuciones
      const expenseDistributions = distributions.map((dist) => ({
        client_id: Number.parseInt(dist.client_id),
        percentage: Number.parseFloat(dist.percentage),
        amount: Number.parseFloat(dist.amount),
        status: formData.status,
      }));

      // Guardar gasto administrativo
      await createAdminExpense(expense, expenseDistributions);

      toast({
        title: "Gasto guardado",
        description: "El gasto administrativo se ha registrado correctamente",
      });

      router.push("/dashboard");
    } catch (error) {
      console.error("Error al guardar el gasto administrativo:", error);
      toast({
        title: "Error",
        description:
          "No se pudo guardar el gasto administrativo. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href="/dashboard">
          <Button
            variant="outline"
            size="sm"
            className="mr-4 border-[#a2d9ce] text-[#148f77]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-[#0e6251]">
          Nuevo Gasto Administrativo
        </h1>
      </div>

      <Card className="max-w-4xl mx-auto border-[#a2d9ce]">
        <form onSubmit={handleSubmit}>
          <CardHeader className="bg-[#f0f9f7] border-b border-[#e8f3f1]">
            <CardTitle className="text-[#0e6251]">
              Registrar Nuevo Gasto Administrativo
            </CardTitle>
            <CardDescription className="text-[#7f8c8d]">
              Ingrese los detalles del gasto y cómo se distribuye entre los
              clientes
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="concept" className="text-[#34495e]">
                  Concepto
                </Label>
                <Input
                  id="concept"
                  placeholder="Ej: Alquiler de oficina"
                  value={formData.concept}
                  onChange={handleChange}
                  className="border-[#a2d9ce] focus:border-[#148f77] focus:ring-[#45b39d]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-[#34495e]">
                  Monto Total
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Ej: 1000.00"
                  value={formData.amount}
                  onChange={handleChange}
                  className="border-[#a2d9ce] focus:border-[#148f77] focus:ring-[#45b39d]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date" className="text-[#34495e]">
                  Fecha
                </Label>
                <DatePicker
                  id="date"
                  selected={formData.date ? new Date(formData.date) : undefined}
                  onSelect={handleDateChange}
                  className="w-full border-[#a2d9ce] focus:border-[#148f77] focus:ring-[#45b39d]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paid_by" className="text-[#34495e]">
                  Pagado por
                </Label>
                <Select
                  value={formData.paid_by}
                  onValueChange={(value) =>
                    handleSelectChange("paid_by", value)
                  }
                >
                  <SelectTrigger
                    id="paid_by"
                    className="border-[#a2d9ce] focus:border-[#148f77] focus:ring-[#45b39d]"
                  >
                    <SelectValue placeholder="Seleccione quién pagó" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shared">Compartido</SelectItem>
                    <SelectItem value="company">Empresa</SelectItem>
                    <SelectItem value="owner">Dueño</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-4 bg-[#e8f3f1]" />

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-[#0e6251]">
                  Distribución entre Clientes
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={distributeEvenly}
                    className="border-[#a2d9ce] text-[#148f77]"
                  >
                    Distribuir Equitativamente
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDistribution}
                    className="border-[#a2d9ce] text-[#148f77]"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 font-medium text-[#34495e] text-sm">
                  <div className="col-span-5">Cliente</div>
                  <div className="col-span-3">Porcentaje (%)</div>
                  <div className="col-span-3">Monto</div>
                  <div className="col-span-1"></div>
                </div>

                {distributions.map((dist, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-4 items-center"
                  >
                    <div className="col-span-5">
                      <Select
                        value={dist.client_id}
                        onValueChange={(value) =>
                          handleDistributionChange(index, "client_id", value)
                        }
                      >
                        <SelectTrigger className="border-[#a2d9ce] focus:border-[#148f77] focus:ring-[#45b39d]">
                          <SelectValue placeholder="Seleccione cliente" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem
                              key={client.id}
                              value={client.id.toString()}
                            >
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        step="0.01"
                        value={dist.percentage}
                        onChange={(e) =>
                          handleDistributionChange(
                            index,
                            "percentage",
                            e.target.value
                          )
                        }
                        className="border-[#a2d9ce] focus:border-[#148f77] focus:ring-[#45b39d]"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="text"
                        value={dist.amount}
                        readOnly
                        className="bg-gray-50 border-[#a2d9ce]"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDistribution(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end items-center mt-2 text-sm">
                  <span
                    className={`font-medium ${
                      totalPercentage === 100
                        ? "text-green-600"
                        : "text-amber-600"
                    }`}
                  >
                    Total: {totalPercentage}%{" "}
                    {totalPercentage === 100 ? "✓" : ""}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between border-t border-[#e8f3f1] pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="border-[#a2d9ce] text-[#148f77]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || totalPercentage !== 100}
              className="bg-[#148f77] hover:bg-[#0e6251] text-white"
            >
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Guardando..." : "Guardar Gasto"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
