import { RLSStatus } from "@/components/rls-status"
import { AuthDebug } from "@/components/auth-debug"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function AdminPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-[#0e6251]">Panel de Administración</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card className="border-[#a2d9ce]">
            <CardHeader className="bg-[#f0f9f7] border-b border-[#e8f3f1]">
              <CardTitle className="text-[#0e6251]">Herramientas de Administración</CardTitle>
              <CardDescription className="text-[#7f8c8d]">
                Acceda a las herramientas de configuración y administración
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <Link href="/admin/initialize-db">
                <Button className="w-full bg-[#148f77] hover:bg-[#0e6251] text-white">Inicializar Base de Datos</Button>
              </Link>
              <Link href="/admin/setup-rls">
                <Button className="w-full bg-[#148f77] hover:bg-[#0e6251] text-white">
                  Configurar Row Level Security
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full border-[#a2d9ce] text-[#148f77]">
                  Volver al Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <AuthDebug />
        </div>

        <RLSStatus />
      </div>
    </div>
  )
}
