"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export default function SetupRLSPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [userId, setUserId] = useState(user?.id || "")
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, message])
  }

  const setupRLS = async () => {
    setLoading(true)
    setResult(null)
    setLogs([])
    addLog("Iniciando configuración de RLS...")

    try {
      // Habilitar RLS en todas las tablas
      addLog("Habilitando RLS en todas las tablas...")
      const { error: rlsError } = await supabase.rpc("setup_rls")
      if (rlsError) throw rlsError

      // Crear tabla de roles si no existe
      addLog("Creando tabla de roles de usuario...")
      const { error: tableError } = await supabase.rpc("create_user_roles_table")
      if (tableError) throw tableError

      // Asignar rol de administrador al usuario actual
      if (userId) {
        addLog(`Asignando rol de administrador al usuario: ${userId}`)
        const { error: roleError } = await supabase.from("user_roles").upsert({ id: userId, role: "admin" })

        if (roleError) throw roleError
      }

      // Crear políticas para administradores
      addLog("Creando políticas para administradores...")
      const { error: policiesError } = await supabase.rpc("create_admin_policies")
      if (policiesError) throw policiesError

      // Crear políticas temporales para desarrollo
      addLog("Creando políticas temporales para desarrollo...")
      const { error: devPoliciesError } = await supabase.rpc("create_dev_policies")
      if (devPoliciesError) throw devPoliciesError

      addLog("¡Configuración de RLS completada con éxito!")
      setResult({
        success: true,
        message:
          "Configuración de RLS completada con éxito. Se han creado políticas para administradores y políticas temporales para desarrollo.",
      })
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

  const setupDirectSQL = async () => {
    setLoading(true)
    setResult(null)
    setLogs([])
    addLog("Configurando RLS directamente...")

    try {
      // Crear funciones auxiliares primero
      addLog("Creando funciones auxiliares para RLS...")
      await supabase.rpc("create_rls_helper_functions").catch((error) => {
        console.warn("Error creando funciones auxiliares:", error)
        addLog("Advertencia: No se pudieron crear las funciones auxiliares. Continuando...")
      })

      // Habilitar RLS en todas las tablas usando rpc
      addLog("Habilitando RLS en todas las tablas...")
      const { error: rlsError } = await supabase.rpc("enable_rls_on_tables")
      if (rlsError) throw rlsError

      // Crear políticas temporales para desarrollo
      addLog("Creando políticas temporales para desarrollo...")
      const { error: devPoliciesError } = await supabase.rpc("create_simple_dev_policies")
      if (devPoliciesError) throw devPoliciesError

      addLog("¡Configuración de RLS completada con éxito!")
      setResult({
        success: true,
        message: "Configuración de RLS completada con éxito. Se han creado políticas temporales para desarrollo.",
      })
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
      <Card className="max-w-2xl mx-auto border-[#a2d9ce]">
        <CardHeader className="bg-[#f0f9f7] border-b border-[#e8f3f1]">
          <CardTitle className="text-[#0e6251]">Configuración de Row Level Security (RLS)</CardTitle>
          <CardDescription className="text-[#7f8c8d]">
            Configure las políticas de seguridad para permitir acceso a los datos
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user-id" className="text-[#34495e]">
                ID de Usuario para Rol de Administrador
              </Label>
              <Input
                id="user-id"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Ingrese el ID del usuario"
                className="border-[#a2d9ce] focus:border-[#148f77] focus:ring-[#45b39d]"
              />
              <p className="text-sm text-[#7f8c8d]">Este usuario tendrá acceso completo a todas las tablas.</p>
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
        <CardFooter className="flex flex-col sm:flex-row gap-3 border-t border-[#e8f3f1] pt-4">
          <Button
            onClick={setupRLS}
            disabled={loading}
            className="w-full sm:w-auto bg-[#148f77] hover:bg-[#0e6251] text-white"
          >
            {loading ? "Configurando..." : "Configurar RLS con Funciones"}
          </Button>
          <Button
            onClick={setupDirectSQL}
            disabled={loading}
            className="w-full sm:w-auto bg-[#45b39d] hover:bg-[#148f77] text-white"
          >
            {loading ? "Configurando..." : "Configurar RLS Directamente"}
          </Button>
          <Link href="/admin" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full border-[#a2d9ce] text-[#148f77]">
              Volver
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
