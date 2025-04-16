"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { NavBar } from "@/components/nav-bar"
import { Toasts } from "@/components/toast"
import "../globals.css"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { checkSupabaseConnection } from "@/lib/supabase"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionChecked, setConnectionChecked] = useState(false)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  // Usar un estado para controlar si ya se ha intentado redirigir
  const [redirectAttempted, setRedirectAttempted] = useState(false)

  // Usar un ref para evitar múltiples verificaciones de conexión
  const connectionCheckRef = useRef(false)

  // Verificar la conexión a Supabase
  useEffect(() => {
    async function verifyConnection() {
      if (connectionCheckRef.current) return

      connectionCheckRef.current = true
      try {
        const isConnected = await checkSupabaseConnection()
        if (!isConnected) {
          setError("No se pudo conectar con Supabase. Verifica tu conexión a internet y las credenciales.")
        }
      } catch (err) {
        console.error("Error verificando conexión:", err)
        setError("Error al verificar la conexión con Supabase.")
      } finally {
        setConnectionChecked(true)
      }
    }

    verifyConnection()
  }, [])

  useEffect(() => {
    // Establecer un timeout para mostrar el contenido incluso si hay problemas de autenticación
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log("Timeout alcanzado, mostrando contenido de dashboard")
        setLoading(false)
      }
    }, 8000) // 8 segundos máximo de espera

    // Solo verificar la sesión una vez que el estado de autenticación se haya cargado
    if (!authLoading) {
      if (!user && !redirectAttempted) {
        console.log("No hay usuario autenticado en el layout del dashboard, redirigiendo a login...")
        setRedirectAttempted(true)

        // Usar setTimeout para evitar redirecciones inmediatas que puedan causar bucles
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else if (user) {
        console.log("Usuario autenticado en dashboard:", user.email)
        setLoading(false)
      }
    }

    return () => clearTimeout(timeoutId)
  }, [user, authLoading, router, redirectAttempted])

  // Función para recargar la página
  const handleRetry = () => {
    window.location.reload()
  }

  // Mostrar pantalla de carga durante la verificación de autenticación
  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f9f8]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#148f77] mb-4"></div>
          <h2 className="text-xl font-semibold text-[#148f77] mb-2">Cargando...</h2>
          <p className="text-[#7f8c8d]">Verificando tu sesión</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f9f8]">
      <NavBar />
      <main className="flex-1 p-4">
        {error && (
          <Alert variant="destructive" className="mb-4 bg-[#fadbd8] border-[#f5b7b1] text-[#943126]">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error de conexión</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>{error}</p>
              <Button
                onClick={handleRetry}
                variant="outline"
                size="sm"
                className="self-end border-[#f5b7b1] hover:bg-[#fadbd8]/50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {children}
      </main>
      <Toasts />
    </div>
  )
}
