"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface TableStatus {
  name: string
  hasRLS: boolean
  policies: string[]
  status: "success" | "warning" | "error"
}

export function RLSStatus() {
  const [loading, setLoading] = useState(true)
  const [tables, setTables] = useState<TableStatus[]>([])
  const [error, setError] = useState<string | null>(null)

  const checkRLSStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      // Obtener información sobre RLS para cada tabla
      const tableNames = ["clients", "client_owners", "transactions", "admin_expenses", "expense_distributions"]
      const tablesStatus: TableStatus[] = []

      for (const tableName of tableNames) {
        try {
          // Verificar si la tabla existe
          const { count, error: countError } = await supabase
            .from(tableName)
            .select("*", { count: "exact", head: true })

          if (countError && countError.code === "PGRST116") {
            // La tabla no existe
            tablesStatus.push({
              name: tableName,
              hasRLS: false,
              policies: [],
              status: "error",
            })
            continue
          }

          // Verificar si RLS está habilitado usando metadatos de Postgres
          const { data: tableInfo, error: tableError } = await supabase
            .from("pg_class")
            .select("relrowsecurity")
            .eq("relname", tableName)
            .single()

          if (tableError) {
            console.error(`Error checking RLS for ${tableName}:`, tableError)
            tablesStatus.push({
              name: tableName,
              hasRLS: false,
              policies: [],
              status: "error",
            })
            continue
          }

          const hasRLS = tableInfo?.relrowsecurity || false

          // Obtener políticas usando metadatos de Postgres
          const { data: policiesData, error: policiesError } = await supabase
            .from("pg_policy")
            .select("polname")
            .eq("tablename", tableName)

          if (policiesError) {
            console.error(`Error getting policies for ${tableName}:`, policiesError)
          }

          const policies = policiesData?.map((p) => p.polname) || []

          let status: "success" | "warning" | "error" = "error"
          if (hasRLS && policies.length > 0) {
            status = "success"
          } else if (hasRLS) {
            status = "warning"
          }

          tablesStatus.push({
            name: tableName,
            hasRLS,
            policies,
            status,
          })
        } catch (err) {
          console.error(`Error processing table ${tableName}:`, err)
          tablesStatus.push({
            name: tableName,
            hasRLS: false,
            policies: [],
            status: "error",
          })
        }
      }

      setTables(tablesStatus)
    } catch (error: any) {
      console.error("Error checking RLS status:", error)
      setError(error.message || "Error al verificar el estado de RLS")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkRLSStatus()
  }, [])

  return (
    <Card className="border-[#a2d9ce]">
      <CardHeader className="bg-[#f0f9f7] border-b border-[#e8f3f1]">
        <CardTitle className="text-[#0e6251] flex justify-between items-center">
          <span>Estado de Row Level Security</span>
          <Button
            onClick={checkRLSStatus}
            variant="outline"
            size="sm"
            disabled={loading}
            className="border-[#a2d9ce] text-[#148f77]"
          >
            {loading ? "Verificando..." : "Actualizar"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="text-center py-4 text-[#7f8c8d]">Verificando estado de RLS...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">Error: {error}</div>
        ) : (
          <div className="space-y-4">
            {tables.map((table) => (
              <div key={table.name} className="border rounded-md p-4 border-[#e8f3f1]">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-[#2c3e50]">{table.name}</h3>
                  {table.status === "success" ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : table.status === "warning" ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-[#7f8c8d] mb-2">RLS: {table.hasRLS ? "Habilitado" : "Deshabilitado"}</p>
                {table.policies.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-[#34495e]">Políticas:</p>
                    <ul className="list-disc list-inside text-sm text-[#7f8c8d] pl-2">
                      {table.policies.map((policy, index) => (
                        <li key={index}>{policy}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-[#7f8c8d]">No hay políticas configuradas</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
