"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { NavBar } from "@/components/nav-bar"
import { Toasts } from "@/components/toast"
import { supabase } from "@/lib/supabase"
import "../globals.css"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession()

        if (!data.session) {
          console.log("No hay sesión activa, redirigiendo a login...")
          window.location.href = "/login"
          return
        }

        setAuthenticated(true)
      } catch (error) {
        console.error("Error al verificar la sesión:", error)
        window.location.href = "/login"
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f9f8]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#148f77] mb-2">Cargando...</h2>
          <p className="text-[#7f8c8d]">Verificando tu sesión</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return null // No renderizar nada mientras se redirige
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#eaf4f1]">
      <NavBar />
      <main className="flex-1 p-4">{children}</main>
      <Toasts />
    </div>
  )
}
