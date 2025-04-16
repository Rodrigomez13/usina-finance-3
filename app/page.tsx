"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  const { user, loading, signIn, signUp } = useAuth()

  // Usar useEffect para manejar la redirección cuando el usuario ya está autenticado
  useEffect(() => {
    // Si ya estamos redirigiendo, no hacer nada
    if (isRedirecting) return

    if (user && !loading) {
      console.log("Usuario ya autenticado en la página de login, redirigiendo al dashboard...")
      setIsRedirecting(true)

      // Usar setTimeout para evitar redirecciones inmediatas que puedan causar bucles
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    }
  }, [user, loading, router, isRedirecting])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        console.error("Error de inicio de sesión:", error.message)
        setError(error.message)
      } else {
        console.log("Login exitoso")
        setSuccess(`Inicio de sesión exitoso como ${email}`)
        setIsRedirecting(true)
      }
    } catch (err: any) {
      console.error("Error inesperado:", err)
      setError(err.message || "Error inesperado")
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    try {
      const { error } = await signUp(email, password)

      if (error) {
        console.error("Error de registro:", error.message)
        setError(error.message)
      } else {
        console.log("Registro exitoso")
        setSuccess(`Registro exitoso como ${email}. Revisa tu correo para confirmar tu cuenta.`)
      }
    } catch (err: any) {
      console.error("Error inesperado:", err)
      setError(err.message || "Error inesperado")
    }
  }

  // Si el usuario ya está autenticado o la página está cargando, mostrar un indicador de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#148f77]">
        <div className="absolute inset-0 bg-[#0e6251]/30 backdrop-blur-sm"></div>
        <div className="relative z-10 w-full max-w-md px-4">
          <Card className="border-[#a2d9ce] bg-white/90 backdrop-blur-md shadow-xl">
            <CardContent className="pt-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#148f77] mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-[#0e6251] mb-2">Verificando sesión...</h2>
              <p className="text-[#34495e] mb-4">Por favor espere</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Si el usuario ya está autenticado, mostrar un mensaje de redirección
  if (user || isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#148f77]">
        <div className="absolute inset-0 bg-[#0e6251]/30 backdrop-blur-sm"></div>
        <div className="relative z-10 w-full max-w-md px-4">
          <Card className="border-[#a2d9ce] bg-white/90 backdrop-blur-md shadow-xl">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-[#148f77] mb-4" />
              <h2 className="text-xl font-bold text-[#0e6251] mb-2">Sesión Iniciada</h2>
              <p className="text-[#34495e] mb-4">Redirigiendo al dashboard...</p>
              <Button onClick={() => router.push("/dashboard")} className="bg-[#148f77] hover:bg-[#0e6251] text-white">
                Ir al Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
                    <Button type="submit" className="w-full bg-[#148f77] hover:bg-[#0e6251] text-white">
                      Iniciar Sesión
                    </Button>
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
                    <Button type="submit" className="w-full bg-[#148f77] hover:bg-[#0e6251] text-white">
                      Registrarse
                    </Button>
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
