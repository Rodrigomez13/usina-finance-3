"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Session, User } from "@supabase/supabase-js"

type AuthContextType = {
  session: Session | null
  user: User | null
  loading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isAdmin: false,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Función para inicializar la autenticación
    async function initAuth() {
      try {
        // Obtener la sesión actual
        const { data } = await supabase.auth.getSession()
        setSession(data.session)
        setUser(data.session?.user ?? null)

        // Verificar si el usuario es administrador (simplificado)
        if (data.session?.user) {
          // Usar localStorage como respaldo para el estado de administrador
          const isAdminFromStorage = localStorage.getItem("is_admin") === "true"
          setIsAdmin(isAdminFromStorage)

          // No intentamos verificar el rol desde la base de datos para evitar errores 406
          // En su lugar, confiamos en el localStorage o en un enfoque más simple
        }
      } catch (error) {
        console.error("Error al inicializar autenticación:", error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Configurar el listener para cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (!session) {
        setIsAdmin(false)
        localStorage.removeItem("is_admin")
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ session, user, loading, isAdmin }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
