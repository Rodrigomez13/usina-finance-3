import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Parámetros de fecha
    const startDate =
      searchParams.get("start_date") || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const endDate = searchParams.get("end_date") || new Date().toISOString()

    // Parámetros de formato y contenido
    const format = searchParams.get("format") || "pdf"
    const reportType = searchParams.get("report_type") || "detailed"
    const includeCharts = searchParams.get("include_charts") === "true"
    const includeTransactions = searchParams.get("include_transactions") !== "false"
    const includeAdminExpenses = searchParams.get("include_admin_expenses") !== "false"

    // Filtros opcionales
    const clientId = searchParams.get("client_id")
    const ownerId = searchParams.get("owner_id")

    // Construir consultas con filtros
    let transactionsQuery = supabase
      .from("transactions")
      .select("*, clients(name)")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false })

    if (clientId) {
      transactionsQuery = transactionsQuery.eq("client_id", clientId)
    }

    // Obtener transacciones
    const { data: transactions, error: txError } = await transactionsQuery

    if (txError) {
      console.error("Error fetching transactions:", txError)
      return NextResponse.json({ error: "Error al obtener transacciones" }, { status: 500 })
    }

    // Obtener gastos administrativos
    const expensesQuery = supabase
      .from("admin_expenses")
      .select("*, expense_distributions(*)")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false })

    const { data: expenses, error: expError } = await expensesQuery

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
      period: `${formatDateRange(startDate, endDate)}`,
      generatedAt: new Date().toISOString(),
      reportType,
      summary: {
        totalLeads,
        totalExpenses,
        totalFunding,
        totalAdminExpenses,
        balance: totalFunding - totalExpenses - totalAdminExpenses,
        roi: totalExpenses > 0 ? (totalLeads / totalExpenses).toFixed(2) : "N/A",
      },
      transactions: includeTransactions ? transactions : [],
      adminExpenses: includeAdminExpenses ? expenses : [],
    }

    // En una implementación real, aquí generaríamos un PDF
    // Por ahora, devolvemos una página HTML simple que simula un PDF
    if (format === "pdf") {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Reporte Financiero - ${reportData.period}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1, h2 { color: #0e6251; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f0f9f7; color: #0e6251; }
            .summary { margin-bottom: 30px; background-color: #f0f9f7; padding: 20px; border-radius: 8px; }
            .summary div { margin-bottom: 10px; }
            .balance { font-weight: bold; font-size: 1.2em; }
            .positive { color: green; }
            .negative { color: red; }
            .header { display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: bold; color: #0e6251; }
            .report-type { background-color: #0e6251; color: white; padding: 5px 10px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Sistema Financiero</div>
            <div class="report-type">${
              reportType === "detailed"
                ? "Reporte Detallado"
                : reportType === "summary"
                  ? "Resumen Ejecutivo"
                  : "Análisis Financiero"
            }</div>
          </div>
          
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
            <div>ROI (Leads/Gastos): ${reportData.summary.roi}</div>
          </div>
          
          ${
            includeTransactions && transactions.length > 0
              ? `
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
              `
              : ""
          }
          
          ${
            includeAdminExpenses && expenses.length > 0
              ? `
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
              `
              : ""
          }
          
          ${
            includeCharts
              ? `
                <h2>Gráficos</h2>
                <p>Los gráficos estarían incluidos aquí en una implementación completa.</p>
                <div style="width: 100%; height: 300px; background-color: #f0f9f7; display: flex; justify-content: center; align-items: center; margin-bottom: 20px; border-radius: 8px;">
                  Gráfico de Gastos vs Fondeos
                </div>
                <div style="width: 100%; height: 300px; background-color: #f0f9f7; display: flex; justify-content: center; align-items: center; border-radius: 8px;">
                  Gráfico de Leads Generados
                </div>
              `
              : ""
          }
          
          <div style="margin-top: 40px; text-align: center; color: #7f8c8d; font-size: 12px;">
            © ${new Date().getFullYear()} Sistema Financiero - Todos los derechos reservados
          </div>
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

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

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

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${months[start.getMonth()]} ${start.getFullYear()}`
  } else {
    return `${start.getDate()} ${months[start.getMonth()]} - ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`
  }
}
