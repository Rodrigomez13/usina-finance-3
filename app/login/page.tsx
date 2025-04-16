"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Error de inicio de sesión:", error.message)
        setError(error.message)
      } else {
        console.log("Login exitoso:", data.user?.email)
        setSuccess(`Inicio de sesión exitoso como ${data.user?.email}`)

        // Redirigir al dashboard después de un breve retraso
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      }
    } catch (err: any) {
      console.error("Error inesperado:", err)
      setError(err.message || "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.error("Error de registro:", error.message)
        setError(error.message)
      } else if (data.user) {
        console.log("Registro exitoso:", data.user.email)
        setSuccess(`Registro exitoso como ${data.user.email}. Revisa tu correo para confirmar tu cuenta.`)
      }
    } catch (err: any) {
      console.error("Error inesperado:", err)
      setError(err.message || "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#148f77]">
      <div className="absolute inset-0 bg-[#0e6251]/30 backdrop-blur-sm"></div>
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Sistema Financiero</h1>
          <p className="text-[#a2d9ce]">Gestión de finanzas para publicidad</p>
        </div>

        <Card className="border-[#a2d9ce] bg-white/90 backdrop-blur-md shadow-xl">
          <CardHeader className="space-y-1 border-b border-[#e8f3f1] pb-4">
            <CardTitle className="text-xl font-bold text-center text-[#0e6251]">Bienvenido</CardTitle>
            <CardDescription className="text-center text-[#34495e]">
              Inicia sesión o crea una cuenta para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {success && (
              <Alert className="mb-4 bg-[#d5f5e3] border-[#a2d9ce] text-[#0e6251]">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#f0f9f7]">
                <TabsTrigger value="login" className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white">
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white"
                >
                  Registrarse
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#34495e]">
                      Correo Electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="border-[#a2d9ce] focus:border-[#148f77] focus:ring-[#45b39d]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[#34495e]">
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="border-[#a2d9ce] focus:border-[#148f77] focus:ring-[#45b39d]"
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive" className="bg-[#fadbd8] border-[#f5b7b1] text-[#943126]">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full bg-[#148f77] hover:bg-[#0e6251] text-white"
                      disabled={loading}
                    >
                      {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
                    </Button>
                    {success && (
                      <Button
                        type="button"
                        className="w-full mt-2 bg-[#45b39d] hover:bg-[#148f77] text-white"
                        onClick={() => router.push("/dashboard")}
                      >
                        Ir al Dashboard
                      </Button>
                    )}
                  </div>
                </form>
              </TabsContent>
              <TabsContent value="register">
                <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-[#34495e]">
                      Correo Electrónico
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="border-[#a2d9ce] focus:border-[#148f77] focus:ring-[#45b39d]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-[#34495e]">
                      Contraseña
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className="border-[#a2d9ce] focus:border-[#148f77] focus:ring-[#45b39d]"
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive" className="bg-[#fadbd8] border-[#f5b7b1] text-[#943126]">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full bg-[#148f77] hover:bg-[#0e6251] text-white"
                      disabled={loading}
                    >
                      {loading ? "Registrando..." : "Registrarse"}
                    </Button>
                    {success && (
                      <Button
                        type="button"
                        className="w-full mt-2 bg-[#45b39d] hover:bg-[#148f77] text-white"
                        onClick={() => router.push("/dashboard")}
                      >
                        Ir al Dashboard
                      </Button>
                    )}
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="border-t border-[#e8f3f1] pt-4">
            <p className="text-xs text-center w-full text-[#7f8c8d]">
              Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
