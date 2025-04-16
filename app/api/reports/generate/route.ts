import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = Number.parseInt(searchParams.get("month") || "0")
    const year = Number.parseInt(searchParams.get("year") || "0")

    if (!month || !year) {
      return NextResponse.json({ error: "Se requiere mes y año" }, { status: 400 })
    }

    // Fechas para el rango del reporte
    const startDate = new Date(year, month - 1, 1).toISOString()
    const endDate = new Date(year, month, 0).toISOString()

    // Obtener transacciones del período
    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select("*, clients(name)")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false })

    if (txError) {
      console.error("Error fetching transactions:", txError)
      return NextResponse.json({ error: "Error al obtener transacciones" }, { status: 500 })
    }

    // Obtener gastos administrativos del período
    const { data: expenses, error: expError } = await supabase
      .from("admin_expenses")
      .select("*, expense_distributions(*, clients(name))")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false })

    if (expError) {
      console.error("Error fetching expenses:", expError)
      return NextResponse.json({ error: "Error al obtener gastos" }, { status: 500 })
    }

    // Calcular totales
    const totalLeads = transactions.filter((tx) => tx.type === "lead").reduce((sum, tx) => sum + tx.amount, 0)

    const totalExpenses = transactions.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0)

    const totalFunding = transactions.filter((tx) => tx.type === "funding").reduce((sum, tx) => sum + tx.amount, 0)

    const totalAdminExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0)

    // Generar datos para el reporte
    const reportData = {
      period: `${getMonthName(month)} ${year}`,
      generatedAt: new Date().toISOString(),
      summary: {
        totalLeads,
        totalExpenses,
        totalFunding,
        totalAdminExpenses,
        balance: totalFunding - totalExpenses - totalAdminExpenses,
      },
      transactions,
      adminExpenses: expenses,
    }

    // En una implementación real, aquí generaríamos un PDF
    // Por ahora, devolvemos los datos en JSON
    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Error al generar reporte" }, { status: 500 })
  }
}

function getMonthName(month: number): string {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]
  return months[month - 1] || ""
}
