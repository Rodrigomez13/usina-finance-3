"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileUp, Check, AlertCircle, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

export default function ImportPage() {
  const router = useRouter()
  const [importType, setImportType] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // Aquí se podría implementar una vista previa del CSV
      // Por ahora, solo mostramos que se seleccionó el archivo
      setPreviewData([])
      setImportResult(null)
    }
  }

  const handleImport = async () => {
    if (!file || !importType) return

    setImporting(true)
    setImportResult(null)

    try {
      // Simular una importación exitosa
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setImportResult({
        success: true,
        message: `Se importaron los datos correctamente desde ${file.name}`,
      })
    } catch (error) {
      setImportResult({
        success: false,
        message: `Error al importar: ${error instanceof Error ? error.message : "Error desconocido"}`,
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/")}
          className="border-[#a2d9ce] hover:bg-[#f0f9f7] hover:text-[#0e6251]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <h1 className="text-3xl font-bold text-[#0e6251]">Importar Datos</h1>
      </div>

      <Tabs defaultValue="import" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="import" className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white">
            Importar desde Google Sheets / CSV
          </TabsTrigger>
          <TabsTrigger value="instructions" className="data-[state=active]:bg-[#148f77] data-[state=active]:text-white">
            Instrucciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import">
          <Card className="bg-white shadow-md border-[#e8f3f1]">
            <CardHeader className="bg-gradient-to-r from-[#f0f9f7] to-white">
              <CardTitle className="text-2xl text-[#0e6251]">Importar desde Google Sheets / CSV</CardTitle>
              <CardDescription>Importa datos desde un archivo CSV exportado de Google Sheets</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="importType" className="block text-sm font-medium text-[#2c3e50]">
                    Tipo de Importación
                  </label>
                  <Select value={importType} onValueChange={setImportType}>
                    <SelectTrigger className="w-full border-[#a2d9ce] focus:ring-[#148f77]">
                      <SelectValue placeholder="Selecciona el tipo de datos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transactions">Transacciones</SelectItem>
                      <SelectItem value="clients">Clientes</SelectItem>
                      <SelectItem value="admin_expenses">Gastos Administrativos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="csvFile" className="block text-sm font-medium text-[#2c3e50]">
                    Archivo CSV
                  </label>
                  <div
                    className="border-2 border-dashed border-[#a2d9ce] rounded-lg p-8 text-center cursor-pointer hover:bg-[#f0f9f7] transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="csvFile"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {file ? (
                      <div className="flex flex-col items-center">
                        <FileUp className="h-12 w-12 text-[#148f77] mb-2" />
                        <p className="text-[#0e6251] font-medium">{file.name}</p>
                        <p className="text-sm text-[#7f8c8d]">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="h-12 w-12 text-[#a2d9ce] mb-2" />
                        <p className="text-[#2c3e50] font-medium">Arrastra y suelta tu archivo CSV aquí</p>
                        <p className="text-sm text-[#7f8c8d]">o haz clic para seleccionar un archivo</p>
                      </div>
                    )}
                  </div>
                </div>

                {importResult && (
                  <Alert
                    variant={importResult.success ? "default" : "destructive"}
                    className={importResult.success ? "bg-green-50 border-green-200" : ""}
                  >
                    {importResult.success ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>{importResult.success ? "Importación exitosa" : "Error en la importación"}</AlertTitle>
                    <AlertDescription>{importResult.message}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end">
                  <Button
                    onClick={handleImport}
                    disabled={!file || !importType || importing}
                    className="bg-[#148f77] hover:bg-[#0e6251] text-white"
                  >
                    {importing ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Importando...
                      </>
                    ) : (
                      <>Importar</>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructions">
          <Card className="bg-white shadow-md border-[#e8f3f1]">
            <CardHeader className="bg-gradient-to-r from-[#f0f9f7] to-white">
              <CardTitle className="text-2xl text-[#0e6251]">Instrucciones</CardTitle>
              <CardDescription>Formato requerido para los archivos CSV de importación</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-[#0e6251] mb-2">Formato para Transacciones:</h3>
                  <p className="mb-2 text-[#2c3e50]">
                    El archivo CSV debe contener las siguientes columnas: client_id, type, amount, date, notes
                    (opcional)
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md border border-[#e8f3f1] font-mono text-sm">
                    Ejemplo: 1,expense,250.50,2025-04-01,Publicidad en Facebook
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#0e6251] mb-2">Formato para Clientes:</h3>
                  <p className="mb-2 text-[#2c3e50]">
                    El archivo CSV debe contener las siguientes columnas: name, owner_id
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md border border-[#e8f3f1] font-mono text-sm">
                    Ejemplo: Nuevo Cliente,1
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[#0e6251] mb-2">Formato para Gastos Administrativos:</h3>
                  <p className="mb-2 text-[#2c3e50]">
                    El archivo CSV debe contener las siguientes columnas: concept, amount, date, paid_by, status
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md border border-[#e8f3f1] font-mono text-sm">
                    Ejemplo: Alquiler de oficina,500,2025-04-01,shared,pending
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
