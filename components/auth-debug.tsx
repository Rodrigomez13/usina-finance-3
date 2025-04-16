"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export function AuthDebug() {
  const { user, session, loading } = useAuth()
  const [showDetails, setShowDetails] = useState(false)

  if (loading) {
    return <div>Cargando información de autenticación...</div>
  }

  return (
    <Card className="mt-4 border-[#a2d9ce]">
      <CardHeader className="bg-[#f0f9f7] border-b border-[#e8f3f1]">
        <CardTitle className="text-[#0e6251] flex justify-between items-center">
          <span>Información de Autenticación</span>
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="outline"
            size="sm"
            className="border-[#a2d9ce] text-[#148f77]"
          >
            {showDetails ? "Ocultar Detalles" : "Mostrar Detalles"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <p>
            <strong>Estado:</strong> {user ? "Autenticado" : "No autenticado"}
          </p>
          <p>
            <strong>Email:</strong> {user?.email || "N/A"}
          </p>
          <p>
            <strong>ID:</strong> {user?.id || "N/A"}
          </p>

          {showDetails && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200 overflow-auto max-h-96">
              <h3 className="text-sm font-bold mb-2">Detalles del usuario:</h3>
              <pre className="text-xs">{JSON.stringify(user, null, 2)}</pre>

              <h3 className="text-sm font-bold mt-4 mb-2">Detalles de la sesión:</h3>
              <pre className="text-xs">{JSON.stringify(session, null, 2)}</pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
