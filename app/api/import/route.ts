"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Papa from "papaparse";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<string>("transactions");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(null);

      // Parsear el archivo para previsualización
      Papa.parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setPreview(results.data.slice(0, 5)); // Mostrar solo las primeras 5 filas
        },
        error: (error) => {
          setError(`Error al procesar el archivo: ${error.message}`);
        },
      });
    }
  };

  const handleImportTypeChange = (value: string) => {
    setImportType(value);
    setError(null);
    setSuccess(null);
  };

  const handleImport = async () => {
    if (!file) {
      setError("Por favor selecciona un archivo para importar");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Parsear el archivo completo
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            // Aquí procesaríamos los datos según el tipo de importación
            const data = results.data;

            // Validar que hay datos
            if (!data || data.length === 0) {
              throw new Error("El archivo no contiene datos");
            }

            // Validar estructura según el tipo de importación
            validateImportData(data, importType);

            // Simular la importación (en producción, aquí llamaríamos a la API)
            await new Promise((resolve) => setTimeout(resolve, 1500));

            setSuccess(`Se importaron ${data.length} registros exitosamente`);
            console.log(`Datos a importar (${importType}):`, data);

            // En producción, aquí llamaríamos a la API para importar los datos
            // const response = await fetch('/api/import', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ type: importType, data })
            // })
            //
            // if (!response.ok) {
            //   const errorData = await response.json()
            //   throw new Error(errorData.message || 'Error al importar datos')
            // }
            //
            // const result = await response.json()
            // setSuccess(`Se importaron ${result.count} registros exitosamente`)
          } catch (error: any) {
            setError(`Error al importar datos: ${error.message}`);
          } finally {
            setLoading(false);
          }
        },
        error: (error) => {
          setError(`Error al procesar el archivo: ${error.message}`);
          setLoading(false);
        },
      });
    } catch (error: any) {
      setError(`Error inesperado: ${error.message}`);
      setLoading(false);
    }
  };

  // Función para validar la estructura de los datos según el tipo de importación
  const validateImportData = (data: any[], type: string) => {
    if (data.length === 0) {
      throw new Error("El archivo no contiene datos");
    }

    const firstRow = data[0];

    switch (type) {
      case "transactions":
        const requiredTransactionFields = [
          "client_id",
          "type",
          "amount",
          "date",
        ];
        for (const field of requiredTransactionFields) {
          if (!(field in firstRow)) {
            throw new Error(
              `El campo '${field}' es requerido para importar transacciones`
            );
          }
        }
        break;
      case "clients":
        const requiredClientFields = ["name", "owner_id"];
        for (const field of requiredClientFields) {
          if (!(field in firstRow)) {
            throw new Error(
              `El campo '${field}' es requerido para importar clientes`
            );
          }
        }
        break;
      case "admin_expenses":
        const requiredExpenseFields = [
          "concept",
          "amount",
          "date",
          "paid_by",
          "status",
        ];
        for (const field of requiredExpenseFields) {
          if (!(field in firstRow)) {
            throw new Error(
              `El campo '${field}' es requerido para importar gastos administrativos`
            );
          }
        }
        break;
      default:
        throw new Error(`Tipo de importación '${type}' no soportado`);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-[#0e6251]">
          Importar Datos
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#0e6251]">
            Importar desde Google Sheets / CSV
          </CardTitle>
          <CardDescription>
            Importa datos desde un archivo CSV exportado de Google Sheets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label
                htmlFor="import-type"
                className="text-sm font-medium text-[#34495e]"
              >
                Tipo de Importación
              </label>
              <Select value={importType} onValueChange={handleImportTypeChange}>
                <SelectTrigger id="import-type">
                  <SelectValue placeholder="Selecciona el tipo de datos a importar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transactions">Transacciones</SelectItem>
                  <SelectItem value="clients">Clientes</SelectItem>
                  <SelectItem value="admin_expenses">
                    Gastos Administrativos
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="file-upload"
                className="text-sm font-medium text-[#34495e]"
              >
                Archivo CSV
              </label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button
                  onClick={handleImport}
                  disabled={!file || loading}
                  className="bg-[#148f77] hover:bg-[#0e6251] text-white"
                >
                  {loading ? (
                    "Importando..."
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Importar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {file && (
              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-sm text-[#34495e]">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>
                    {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </span>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-[#d4f6e9] text-[#0e6251] border-[#a2d9ce]">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Éxito</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {preview.length > 0 && (
              <div className="grid gap-2">
                <h3 className="text-sm font-medium text-[#34495e]">
                  Vista previa:
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr className="bg-[#f0f9f7]">
                        {Object.keys(preview[0]).map((key) => (
                          <th
                            key={key}
                            className="border border-[#e8f3f1] p-2 text-left text-[#0e6251]"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, index) => (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-[#f8fcfb]"
                          }
                        >
                          {Object.values(row).map((value: any, i) => (
                            <td key={i} className="border border-[#e8f3f1] p-2">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#0e6251]">Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-medium text-[#34495e]">
                Formato para Transacciones:
              </h3>
              <p className="text-sm text-[#7f8c8d]">
                El archivo CSV debe contener las siguientes columnas: client_id,
                type, amount, date, notes (opcional)
              </p>
              <p className="text-sm text-[#7f8c8d] mt-1">
                Ejemplo: 1,expense,250.50,2025-04-01,Publicidad en Facebook
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#34495e]">
                Formato para Clientes:
              </h3>
              <p className="text-sm text-[#7f8c8d]">
                El archivo CSV debe contener las siguientes columnas: name,
                owner_id
              </p>
              <p className="text-sm text-[#7f8c8d] mt-1">
                Ejemplo: Nuevo Cliente,1
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[#34495e]">
                Formato para Gastos Administrativos:
              </h3>
              <p className="text-sm text-[#7f8c8d]">
                El archivo CSV debe contener las siguientes columnas: concept,
                amount, date, paid_by, status
              </p>
              <p className="text-sm text-[#7f8c8d] mt-1">
                Ejemplo: Alquiler de oficina,500,2025-04-01,shared,pending
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
