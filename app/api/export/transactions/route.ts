import { NextResponse } from "next/server"
import { exportTransactionsToCSV } from "@/lib/api"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate =
      searchParams.get("startDate") || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const endDate = searchParams.get("endDate") || new Date().toISOString()

    const csvContent = await exportTransactionsToCSV(startDate, endDate)

    // Configurar headers para descarga de archivo
    const headers = new Headers()
    headers.append("Content-Type", "text/csv; charset=utf-8")
    headers.append(
      "Content-Disposition",
      `attachment; filename="transacciones_${new Date().toISOString().split("T")[0]}.csv"`,
    )

    return new NextResponse(csvContent, {
      status: 200,
      headers,
    })
  } catch (error) {
    console.error("Error exporting transactions:", error)
    return NextResponse.json({ error: "Error al exportar transacciones" }, { status: 500 })
  }
}
