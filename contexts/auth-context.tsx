"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useRef } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import type { Session, User, AuthError } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Usar useRef para controlar el estado de redirección y evitar bucles
  const redirectedRef = useRef(false)
  const authCheckDoneRef = useRef(false)
  const authTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)
  const supabaseClientRef = useRef(getSupabaseClient())

  // Función para limpiar el estado de redirección después de un tiempo
  const resetRedirectState = () => {
    setTimeout(() => {
      redirectedRef.current = false
    }, 5000) // Esperar 5 segundos antes de permitir otra redirección
  }

  useEffect(() => {
    // Función para obtener la sesión actual
    const setData = async () => {
      try {
        console.log("Verificando sesión de autenticación...")

        // Verificar que el cliente de Supabase esté disponible
        const supabase = supabaseClientRef.current
        if (!supabase) {
          console.error("Cliente Supabase no disponible")
          setLoading(false)
          return
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()

        console.log("Sesión actual:", session?.user?.email || "No hay sesión")
        setSession(session)
        setUser(session?.user ?? null)

        // Marcar que la verificación de autenticación se ha completado
        authCheckDoneRef.current = true

        // Si hay un timeout pendiente, limpiarlo
        if (authTimeoutRef.current) {
          clearTimeout(authTimeoutRef.current)
        }
      } catch (error) {
        console.error("Error al obtener la sesión:", error)
        authCheckDoneRef.current = true
      } finally {
        setLoading(false)
      }
    }

    // Establecer un timeout para asegurar que el estado de loading no se quede atascado
    authTimeoutRef.current = setTimeout(() => {
      if (loading) {
        console.log("Timeout de autenticación alcanzado, estableciendo loading a false")
        setLoading(false)
        authCheckDoneRef.current = true
      }
    }, 10000) // 10 segundos máximo para la verificación de autenticación

    setData()

    // Suscribirse a cambios en el estado de autenticación
    const supabase = supabaseClientRef.current
    if (supabase && !subscriptionRef.current) {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        console.log("Cambio en el estado de autenticación:", _event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Solo redirigir si no se ha redirigido antes y la verificación inicial se ha completado
        if (_event === "SIGNED_IN" && !redirectedRef.current && authCheckDoneRef.current) {
          console.log("Usuario ha iniciado sesión, redirigiendo al dashboard...")
          redirectedRef.current = true

          // Usar setTimeout para dar tiempo a que se complete la autenticación
          setTimeout(() => {
            router.push("/dashboard")
            resetRedirectState()
          }, 1000)
        } else if (_event === "SIGNED_OUT" && !redirectedRef.current && authCheckDoneRef.current) {
          console.log("Usuario ha cerrado sesión, redirigiendo a login...")
          redirectedRef.current = true

          setTimeout(() => {
            router.push("/")
            resetRedirectState()
          }, 1000)
        }
      })

      subscriptionRef.current = data.subscription
    }

    return () => {
      // Limpiar la suscripción al desmontar
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }

      // Limpiar el timeout
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current)
      }
    }
  }, [router, loading])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const supabase = supabaseClientRef.current
      if (!supabase) {
        console.error("Cliente Supabase no disponible para iniciar sesión")
        return { error: new Error("Cliente Supabase no disponible") as AuthError }
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      console.log("Resultado de inicio de sesión:", data.user?.email, error?.message)

      if (!error && !redirectedRef.current) {
        console.log("Login exitoso, redirigiendo al dashboard...")
        redirectedRef.current = true

        // Usar setTimeout para dar tiempo a que se complete la autenticación
        setTimeout(() => {
          router.push("/dashboard")
          resetRedirectState()
        }, 1500)
      }

      return { error }
    } catch (error: any) {
      console.error("Error inesperado en signIn:", error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    try {
      const supabase = supabaseClientRef.current
      if (!supabase) {
        console.error("Cliente Supabase no disponible para registrarse")
        return { error: new Error("Cliente Supabase no disponible") as AuthError }
      }

      const { data, error } = await supabase.auth.signUp({ email, password })
      console.log("Resultado de registro:", data.user?.email, error?.message)
      return { error }
    } catch (error: any) {
      console.error("Error inesperado en signUp:", error)
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const supabase = supabaseClientRef.current
      if (!supabase) {
        console.error("Cliente Supabase no disponible para cerrar sesión")
        return
      }

      await supabase.auth.signOut()
      console.log("Sesión cerrada, redirigiendo a login...")
      if (!redirectedRef.current) {
        redirectedRef.current = true

        setTimeout(() => {
          router.push("/")
          resetRedirectState()
        }, 1000)
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
