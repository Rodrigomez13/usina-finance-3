import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = Number.parseInt(searchParams.get("month") || "0")
    const year = Number.parseInt(searchParams.get("year") || "0")
    const format = searchParams.get("format") || "pdf"

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
      .select("*, expense_distributions(*)")
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
    // Por ahora, devolvemos los datos en JSON con un header que indica que es un PDF
    if (format === "pdf") {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Reporte Financiero - ${reportData.period}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #0e6251; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f0f9f7; color: #0e6251; }
            .summary { margin-bottom: 30px; }
            .summary div { margin-bottom: 10px; }
            .balance { font-weight: bold; }
            .positive { color: green; }
            .negative { color: red; }
          </style>
        </head>
        <body>
          <h1>Reporte Financiero - ${reportData.period}</h1>
          <p>Generado el: ${new Date(reportData.generatedAt).toLocaleString()}</p>
          
          <div class="summary">
            <h2>Resumen</h2>
            <div>Total Leads: ${reportData.summary.totalLeads}</div>
            <div>Total Gastos: $${reportData.summary.totalExpenses.toFixed(2)}</div>
            <div>Total Fondeos: $${reportData.summary.totalFunding.toFixed(2)}</div>
            <div>Total Gastos Administrativos: $${reportData.summary.totalAdminExpenses.toFixed(2)}</div>
            <div class="balance ${reportData.summary.balance >= 0 ? "positive" : "negative"}">
              Balance: $${reportData.summary.balance.toFixed(2)}
            </div>
          </div>
          
          <h2>Transacciones</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              ${transactions
                .map(
                  (tx) => `
                <tr>
                  <td>${new Date(tx.date).toLocaleDateString()}</td>
                  <td>${tx.clients?.name || "-"}</td>
                  <td>${
                    tx.type === "funding"
                      ? "Fondeo"
                      : tx.type === "expense"
                        ? "Gasto"
                        : tx.type === "lead"
                          ? "Lead"
                          : tx.type
                  }</td>
                  <td>${tx.type === "lead" ? tx.amount : "$" + tx.amount.toFixed(2)}</td>
                  <td>${tx.notes || "-"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          
          <h2>Gastos Administrativos</h2>
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${expenses
                .map(
                  (exp) => `
                <tr>
                  <td>${new Date(exp.date).toLocaleDateString()}</td>
                  <td>${exp.concept}</td>
                  <td>$${exp.amount.toFixed(2)}</td>
                  <td>${exp.status === "paid" ? "Pagado" : "Pendiente"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
        </body>
        </html>
        `,
        {
          headers: {
            "Content-Type": "text/html",
          },
        },
      )
    }

    // Si no es PDF, devolvemos JSON
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
