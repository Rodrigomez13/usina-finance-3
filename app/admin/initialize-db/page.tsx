"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function InitializeDBPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [step, setStep] = useState(1)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message])
  }

  const createTables = async () => {
    setLoading(true)
    setResult(null)
    addLog("Iniciando creación de tablas...")

    try {
      // Crear tablas básicas
      addLog("Creando tablas de propietarios de clientes...")
      const { error: ownersError } = await supabase
        .from("client_owners")
        .select("id")
        .limit(1)
        .maybeSingle()
        .then(async ({ error }) => {
          if (error && error.code === "PGRST116") {
            // La tabla no existe, vamos a crearla
            return await supabase.rpc("create_client_owners_table")
          }
          return { error: null }
        })

      if (ownersError) throw ownersError

      addLog("Creando tablas de clientes...")
      const { error: clientsError } = await supabase
        .from("clients")
        .select("id")
        .limit(1)
        .maybeSingle()
        .then(async ({ error }) => {
          if (error && error.code === "PGRST116") {
            // La tabla no existe, vamos a crearla
            return await supabase.rpc("create_clients_table")
          }
          return { error: null }
        })

      if (clientsError) throw clientsError

      addLog("Creando tablas de transacciones...")
      const { error: transactionsError } = await supabase
        .from("transactions")
        .select("id")
        .limit(1)
        .maybeSingle()
        .then(async ({ error }) => {
          if (error && error.code === "PGRST116") {
            // La tabla no existe, vamos a crearla
            return await supabase.rpc("create_transactions_table")
          }
          return { error: null }
        })

      if (transactionsError) throw transactionsError

      addLog("Creando tablas de gastos administrativos...")
      const { error: expensesError } = await supabase
        .from("admin_expenses")
        .select("id")
        .limit(1)
        .maybeSingle()
        .then(async ({ error }) => {
          if (error && error.code === "PGRST116") {
            // La tabla no existe, vamos a crearla
            return await supabase.rpc("create_admin_expenses_table")
          }
          return { error: null }
        })

      if (expensesError) throw expensesError

      addLog("Creando tablas de distribuciones de gastos...")
      const { error: distributionsError } = await supabase
        .from("expense_distributions")
        .select("id")
        .limit(1)
        .maybeSingle()
        .then(async ({ error }) => {
          if (error && error.code === "PGRST116") {
            // La tabla no existe, vamos a crearla
            return await supabase.rpc("create_expense_distributions_table")
          }
          return { error: null }
        })

      if (distributionsError) throw distributionsError

      addLog("Creando tabla de roles de usuario...")
      const { error: rolesError } = await supabase
        .from("user_roles")
        .select("id")
        .limit(1)
        .maybeSingle()
        .then(async ({ error }) => {
          if (error && error.code === "PGRST116") {
            // La tabla no existe, vamos a crearla
            return await supabase.rpc("create_user_roles_table")
          }
          return { error: null }
        })

      if (rolesError) throw rolesError

      addLog("Creando funciones auxiliares para RLS...")
      const { error: funcError } = await supabase.rpc("create_rls_helper_functions")
      if (funcError) throw funcError

      addLog("¡Todas las tablas creadas con éxito!")
      setResult({
        success: true,
        message: "Todas las tablas han sido creadas correctamente.",
      })
      setStep(2)
    } catch (error: any) {
      console.error("Error creando tablas:", error)
      addLog(`ERROR: ${error.message || "Error desconocido"}`)
      setResult({
        success: false,
        message: `Error: ${error.message || "Ocurrió un error desconocido"}`,
      })
    } finally {
      setLoading(false)
    }
  }

  const insertInitialData = async () => {
    setLoading(true)
    setResult(null)
    addLog("Iniciando inserción de datos iniciales...")

    try {
      // Verificar si ya existen datos
      addLog("Verificando si ya existen datos...")
      const { data: owners } = await supabase.from("client_owners").select("id")

      if (!owners || owners.length === 0) {
        // Insertar propietarios
        addLog("Insertando propietarios de clientes...")
        const { error: ownersError } = await supabase
          .from("client_owners")
          .insert([{ name: "Dueño 1" }, { name: "Dueño 2" }, { name: "Dueño 3" }, { name: "Dueño 4" }])

        if (ownersError) throw ownersError

        // Obtener los IDs insertados
        const { data: insertedOwners, error: selectError } = await supabase.from("client_owners").select("id, name")
        if (selectError) throw selectError

        if (insertedOwners && insertedOwners.length > 0) {
          const ownerMap: Record<string, number> = {}
          insertedOwners.forEach((owner: any) => {
            ownerMap[owner.name] = owner.id
          })

          // Insertar clientes
          addLog("Insertando clientes...")
          const { error: clientsError } = await supabase.from("clients").insert([
            { name: "Fenix", owner_id: ownerMap["Dueño 1"] },
            { name: "Eros", owner_id: ownerMap["Dueño 1"] },
            { name: "Fortuna", owner_id: ownerMap["Dueño 2"] },
            { name: "Gana24", owner_id: ownerMap["Dueño 2"] },
            { name: "Atenea", owner_id: ownerMap["Dueño 3"] },
            { name: "Flashbet", owner_id: ownerMap["Dueño 4"] },
          ])

          if (clientsError) throw clientsError
          addLog("Clientes insertados correctamente")
        }
      } else {
        addLog("Ya existen datos en la base de datos, omitiendo inserción inicial")
      }

      addLog("¡Datos iniciales insertados con éxito!")
      setResult({
        success: true,
        message: "Los datos iniciales han sido insertados correctamente.",
      })
      setStep(3)
    } catch (error: any) {
      console.error("Error insertando datos iniciales:", error)
      addLog(`ERROR: ${error.message || "Error desconocido"}`)
      setResult({
        success: false,
        message: `Error: ${error.message || "Ocurrió un error desconocido"}`,
      })
    } finally {
      setLoading(false)
    }
  }

  const setupRLS = async () => {
    setLoading(true)
    setResult(null)
    addLog("Configurando Row Level Security (RLS)...")

    try {
      // Habilitar RLS en todas las tablas
      addLog("Habilitando RLS en todas las tablas...")
      const { error: rlsError } = await supabase.rpc("setup_rls")
      if (rlsError) throw rlsError

      // Crear políticas temporales para desarrollo
      addLog("Creando políticas temporales para desarrollo...")
      const { error: policiesError } = await supabase.rpc("create_dev_policies")
      if (policiesError) throw policiesError

      addLog("¡RLS configurado con éxito!")
      setResult({
        success: true,
        message: "Row Level Security (RLS) ha sido configurado correctamente con políticas temporales para desarrollo.",
      })
      setStep(4)
    } catch (error: any) {
      console.error("Error configurando RLS:", error)
      addLog(`ERROR: ${error.message || "Error desconocido"}`)
      setResult({
        success: false,
        message: `Error: ${error.message || "Ocurrió un error desconocido"}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto border-[#a2d9ce]">
        <CardHeader className="bg-[#f0f9f7] border-b border-[#e8f3f1]">
          <CardTitle className="text-[#0e6251]">Inicialización de Base de Datos</CardTitle>
          <CardDescription className="text-[#7f8c8d]">
            Cree las tablas necesarias e inserte datos iniciales para el sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step > 1 ? "bg-green-500 text-white" : "bg-[#148f77] text-white"
                }`}
              >
                {step > 1 ? <CheckCircle className="h-5 w-5" /> : "1"}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#2c3e50]">Crear Tablas</h3>
                <p className="text-sm text-[#7f8c8d]">Crea todas las tablas necesarias para el sistema</p>
              </div>
              <Button
                onClick={createTables}
                disabled={loading || step > 1}
                className="bg-[#148f77] hover:bg-[#0e6251] text-white"
              >
                {loading && step === 1 ? "Creando..." : "Crear Tablas"}
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step > 2
                    ? "bg-green-500 text-white"
                    : step === 2
                      ? "bg-[#148f77] text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > 2 ? <CheckCircle className="h-5 w-5" /> : "2"}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#2c3e50]">Insertar Datos Iniciales</h3>
                <p className="text-sm text-[#7f8c8d]">Inserta datos de ejemplo para comenzar a usar el sistema</p>
              </div>
              <Button
                onClick={insertInitialData}
                disabled={loading || step !== 2}
                className={
                  step === 2
                    ? "bg-[#148f77] hover:bg-[#0e6251] text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }
              >
                {loading && step === 2 ? "Insertando..." : "Insertar Datos"}
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step > 3
                    ? "bg-green-500 text-white"
                    : step === 3
                      ? "bg-[#148f77] text-white"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > 3 ? <CheckCircle className="h-5 w-5" /> : "3"}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#2c3e50]">Configurar RLS</h3>
                <p className="text-sm text-[#7f8c8d]">Configura Row Level Security para proteger los datos</p>
              </div>
              <Button
                onClick={setupRLS}
                disabled={loading || step !== 3}
                className={
                  step === 3
                    ? "bg-[#148f77] hover:bg-[#0e6251] text-white"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }
              >
                {loading && step === 3 ? "Configurando..." : "Configurar RLS"}
              </Button>
            </div>

            {result && (
              <Alert
                variant={result.success ? "default" : "destructive"}
                className={
                  result.success
                    ? "bg-[#d5f5e3] border-[#a2d9ce] text-[#0e6251]"
                    : "bg-[#fadbd8] border-[#f5b7b1] text-[#943126]"
                }
              >
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Éxito" : "Error"}</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}

            {logs.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-[#2c3e50] mb-2">Registro de operaciones:</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3 max-h-60 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className={`text-sm ${
                        log.startsWith("ERROR")
                          ? "text-red-600"
                          : log.startsWith("¡")
                            ? "text-green-600"
                            : "text-gray-700"
                      }`}
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-[#e8f3f1] pt-4">
          <Link href="/admin">
            <Button variant="outline" className="border-[#a2d9ce] text-[#148f77]">
              Volver al Panel de Administración
            </Button>
          </Link>
          {step === 4 && (
            <Link href="/">
              <Button className="bg-[#148f77] hover:bg-[#0e6251] text-white">Ir al Dashboard</Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
