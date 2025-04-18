// Importar los tipos necesarios
import type { Transaction, AdminExpense, ClientGroup, ClientStats, DashboardStats } from "@/types/index"

// Función para obtener estadísticas del dashboard
export async function getDashboardStats(startDate?: Date, endDate?: Date): Promise<DashboardStats> {
  try {
    console.log("Iniciando obtención de estadísticas del dashboard...")

    // Usar fechas proporcionadas o predeterminadas
    const now = new Date()
    const firstDayOfMonth = startDate || new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Asegurarnos de que la fecha de inicio sea el inicio del día (00:00:00)
    const start = new Date(firstDayOfMonth)
    start.setHours(0, 0, 0, 0)

    // Asegurarnos de que la fecha final sea el final del día (23:59:59)
    const end = new Date(lastDayOfMonth)
    end.setHours(23, 59, 59, 999)

    // Importar el cliente de Supabase directamente para evitar problemas de inicialización
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      return {
        totalLeads: 0,
        totalExpenses: 0,
        totalFunding: 0,
        balance: 0,
      }
    }

    // Obtener estadísticas de leads
    let leadsData: any[] = []
    try {
      console.log("Obteniendo datos de leads...")
      const { data, error } = await supabase
        .from("transactions")
        .select("amount")
        .eq("type", "lead")
        .gte("date", start.toISOString())
        .lte("date", end.toISOString())

      if (error) throw error
      console.log(`Datos de leads obtenidos: ${data?.length || 0} registros`)
      leadsData = data || []
    } catch (err) {
      console.error("Error al obtener datos de leads:", err)
      // Continuamos con un array vacío
      leadsData = []
    }

    // Obtener estadísticas de gastos
    let expensesData: any[] = []
    try {
      console.log("Obteniendo datos de gastos...")
      const { data, error } = await supabase
        .from("transactions")
        .select("amount")
        .eq("type", "expense")
        .gte("date", start.toISOString())
        .lte("date", end.toISOString())

      if (error) throw error
      console.log(`Datos de gastos obtenidos: ${data?.length || 0} registros`)
      expensesData = data || []
    } catch (err) {
      console.error("Error al obtener datos de gastos:", err)
      // Continuamos con un array vacío
      expensesData = []
    }

    // Obtener estadísticas de fondeos
    let fundingData: any[] = []
    try {
      console.log("Obteniendo datos de fondeos...")
      const { data, error } = await supabase
        .from("transactions")
        .select("amount")
        .eq("type", "funding")
        .gte("date", start.toISOString())
        .lte("date", end.toISOString())

      if (error) throw error
      console.log(`Datos de fondeos obtenidos: ${data?.length || 0} registros`)
      fundingData = data || []
    } catch (err) {
      console.error("Error al obtener datos de fondeos:", err)
      // Continuamos con un array vacío
      fundingData = []
    }

    // Calcular totales
    const totalLeads = leadsData.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
    const totalExpenses = expensesData.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
    const totalFunding = fundingData.reduce((sum, item) => sum + (item.amount || 0), 0) || 0
    const balance = totalFunding - totalExpenses

    console.log("Estadísticas calculadas:", { totalLeads, totalExpenses, totalFunding, balance })

    return {
      totalLeads,
      totalExpenses,
      totalFunding,
      balance,
    }
  } catch (error) {
    console.error("Error inesperado al obtener estadísticas del dashboard:", error)
    // Devolver valores por defecto en caso de error
    return {
      totalLeads: 0,
      totalExpenses: 0,
      totalFunding: 0,
      balance: 0,
    }
  }
}

// Función para obtener transacciones recientes
export async function getRecentTransactions(startDate?: Date, endDate?: Date): Promise<Transaction[]> {
  try {
    console.log("Obteniendo transacciones recientes...")

    // Importar el cliente de Supabase directamente
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      return []
    }

    // Usar fechas proporcionadas o predeterminadas
    const now = new Date()
    const firstDayOfMonth = startDate || new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Asegurarnos de que la fecha de inicio sea el inicio del día (00:00:00)
    const start = new Date(firstDayOfMonth)
    start.setHours(0, 0, 0, 0)

    // Asegurarnos de que la fecha final sea el final del día (23:59:59)
    const end = new Date(lastDayOfMonth)
    end.setHours(23, 59, 59, 999)

    // Obtener las 5 transacciones más recientes en el rango de fechas
    const { data, error } = await supabase
      .from("transactions")
      .select("*, clients(name)")
      .gte("date", start.toISOString())
      .lte("date", end.toISOString())
      .order("date", { ascending: false })
      .limit(5)

    if (error) {
      console.error("Error al obtener transacciones recientes:", error)
      return []
    }

    console.log(`Transacciones recientes obtenidas: ${data?.length || 0} registros`)
    return data || []
  } catch (error) {
    console.error("Error inesperado al obtener transacciones recientes:", error)
    return []
  }
}

export async function getRecentTransactionsByDate(startDate: Date, endDate: Date): Promise<any[]> {
  try {
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      return []
    }

    // Asegurarnos de que la fecha de inicio sea el inicio del día (00:00:00)
    const start = new Date(startDate)
    start.setHours(0, 0, 0, 0)

    // Asegurarnos de que la fecha final sea el final del día (23:59:59)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    console.log(`Filtrando transacciones desde ${start.toISOString()} hasta ${end.toISOString()}`)

    const { data, error } = await supabase.rpc("get_transactions_in_range", {
      start_date: start.toISOString(),
      end_date: end.toISOString(),
    })

    if (error) {
      console.error("Error al ejecutar SQL crudo:", error)
      return []
    }

    return data
  } catch (err) {
    console.error("Error general:", err)
    return []
  }
}

// Interfaz para los datos de transacción
interface TransactionInput {
  client_id: number
  type: "funding" | "expense" | "lead"
  amount: number
  date: string
  notes: string | null
  created_by: string
  payment_method?: string
  category?: string
  cost_per_lead?: number | null
}

// Función para crear una transacción
export async function createTransaction(transaction: TransactionInput): Promise<Transaction> {
  try {
    console.log("Creando nueva transacción:", transaction)

    // Importar el cliente de Supabase directamente
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      throw new Error("No se pudo inicializar el cliente de Supabase")
    }

    // Insertar la transacción en la base de datos
    const { data, error } = await supabase.from("transactions").insert(transaction).select().single()

    if (error) {
      console.error("Error al crear transacción:", error)
      throw error
    }

    console.log("Transacción creada exitosamente:", data)
    return data
  } catch (error) {
    console.error("Error inesperado al crear transacción:", error)
    throw error
  }
}

// Función para obtener grupos de clientes
export async function getClientGroups(): Promise<ClientGroup[]> {
  try {
    console.log("Obteniendo grupos de clientes...")

    // Importar el cliente de Supabase directamente
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      return []
    }

    // Obtener propietarios con sus clientes
    const { data: owners, error: ownersError } = await supabase
      .from("client_owners")
      .select("id, name, clients(id, name, owner_id, created_at)")
      .order("name")

    if (ownersError) {
      console.error("Error al obtener grupos de clientes:", ownersError)
      return []
    }

    // Transformar los datos al formato esperado
    const groups: ClientGroup[] = (owners || []).map((owner) => {
      // Asegurarse de que owner.clients sea un array
      const clients = Array.isArray(owner.clients) ? owner.clients : []

      return {
        id: owner.id,
        name: owner.name,
        owner: owner.name,
        clients: clients,
      }
    })

    console.log(`Grupos de clientes obtenidos: ${groups.length} grupos`)
    return groups
  } catch (error) {
    console.error("Error inesperado al obtener grupos de clientes:", error)
    return []
  }
}

// Función para obtener estadísticas de clientes
export async function getClientStats(startDate?: Date, endDate?: Date): Promise<ClientStats> {
  try {
    console.log("Obteniendo estadísticas de clientes...")

    // Importar el cliente de Supabase directamente
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      return {}
    }

    // Usar fechas proporcionadas o predeterminadas
    const now = new Date()
    const firstDayOfMonth = startDate || new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Asegurarnos de que la fecha de inicio sea el inicio del día (00:00:00)
    const start = new Date(firstDayOfMonth)
    start.setHours(0, 0, 0, 0)

    // Asegurarnos de que la fecha final sea el final del día (23:59:59)
    const end = new Date(lastDayOfMonth)
    end.setHours(23, 59, 59, 999)

    // Obtener todos los clientes
    const { data: clients, error: clientsError } = await supabase.from("clients").select("id, name").order("name")

    if (clientsError) {
      console.error("Error al obtener clientes:", clientsError)
      return {}
    }

    // Obtener todas las transacciones en el rango de fechas
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("client_id, type, amount, clients(name)")
      .gte("date", start.toISOString())
      .lte("date", end.toISOString())

    if (transactionsError) {
      console.error("Error al obtener transacciones:", transactionsError)
      return {}
    }

    // Calcular estadísticas por cliente
    const stats: ClientStats = {}

    // Inicializar estadísticas para cada cliente
    clients.forEach((client) => {
      stats[client.name] = {
        leads: 0,
        expenses: 0,
        funding: 0,
        balance: 0,
      }
    })

    // Calcular estadísticas basadas en transacciones
    transactions.forEach((tx) => {
      const clientName = tx.clients?.name
      if (!clientName || !stats[clientName]) return

      if (tx.type === "lead") {
        stats[clientName].leads += tx.amount || 0
      } else if (tx.type === "expense") {
        stats[clientName].expenses += tx.amount || 0
      } else if (tx.type === "funding") {
        stats[clientName].funding += tx.amount || 0
      }
    })

    // Calcular balance para cada cliente
    Object.keys(stats).forEach((clientName) => {
      stats[clientName].balance = stats[clientName].funding - stats[clientName].expenses
    })

    console.log("Estadísticas de clientes calculadas")
    return stats
  } catch (error) {
    console.error("Error inesperado al obtener estadísticas de clientes:", error)
    return {}
  }
}

// Función para obtener la lista de clientes
export async function getClients() {
  try {
    console.log("Obteniendo lista de clientes...")

    // Importar el cliente de Supabase directamente
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      return []
    }

    // Obtener todos los clientes
    const { data, error } = await supabase.from("clients").select("id, name").order("name")

    if (error) {
      console.error("Error al obtener clientes:", error)
      return []
    }

    console.log(`Clientes obtenidos: ${data?.length || 0} clientes`)
    return data || []
  } catch (error) {
    console.error("Error inesperado al obtener clientes:", error)
    return []
  }
}

// Función para obtener gastos administrativos
export async function getAdminExpenses(startDate?: Date, endDate?: Date): Promise<AdminExpense[]> {
  try {
    console.log("Obteniendo gastos administrativos...")

    // Importar el cliente de Supabase directamente
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      return []
    }

    // Usar fechas proporcionadas o predeterminadas
    const now = new Date()
    const firstDayOfMonth = startDate || new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Asegurarnos de que la fecha de inicio sea el inicio del día (00:00:00)
    const start = new Date(firstDayOfMonth)
    start.setHours(0, 0, 0, 0)

    // Asegurarnos de que la fecha final sea el final del día (23:59:59)
    const end = new Date(lastDayOfMonth)
    end.setHours(23, 59, 59, 999)

    // Obtener gastos administrativos con sus distribuciones
    const { data, error } = await supabase
      .from("admin_expenses")
      .select("*, expense_distributions(*, clients(name))")
      .gte("date", start.toISOString())
      .lte("date", end.toISOString())
      .order("date", { ascending: false })

    if (error) {
      console.error("Error al obtener gastos administrativos:", error)
      return []
    }

    console.log(`Gastos administrativos obtenidos: ${data?.length || 0} gastos`)
    return data || []
  } catch (error) {
    console.error("Error inesperado al obtener gastos administrativos:", error)
    return []
  }
}

// Función para obtener gastos administrativos recientes
export async function getRecentAdminExpenses(startDate?: Date, endDate?: Date): Promise<any[]> {
  try {
    console.log("Obteniendo gastos administrativos recientes...")

    // Importar el cliente de Supabase directamente
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      return []
    }

    // Usar fechas proporcionadas o predeterminadas
    const now = new Date()
    const firstDayOfMonth = startDate || new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Asegurarnos de que la fecha de inicio sea el inicio del día (00:00:00)
    const start = new Date(firstDayOfMonth)
    start.setHours(0, 0, 0, 0)

    // Asegurarnos de que la fecha final sea el final del día (23:59:59)
    const end = new Date(lastDayOfMonth)
    end.setHours(23, 59, 59, 999)

    console.log(`Filtrando gastos administrativos desde ${start.toISOString()} hasta ${end.toISOString()}`)

    // Obtener los gastos administrativos recientes
    const { data, error } = await supabase
      .from("admin_expenses")
      .select("id, concept, amount, date, status, paid_by")
      .gte("date", start.toISOString())
      .lte("date", end.toISOString())
      .order("date", { ascending: false })
      .limit(5)

    if (error) {
      console.error("Error al obtener gastos administrativos recientes:", error)
      return []
    }

    // Transformar los datos para que coincidan con el formato esperado
    const formattedData = data.map((expense) => ({
      id: expense.id,
      concept: expense.concept,
      amount: expense.amount,
      date: expense.date,
      status: expense.status,
      client_name: expense.paid_by === "shared" ? "Compartido" : expense.paid_by,
    }))

    return formattedData || []
  } catch (error) {
    console.error("Error inesperado al obtener gastos administrativos recientes:", error)
    return []
  }
}

// Interfaz para los datos de gasto administrativo
interface AdminExpenseInput {
  concept: string
  amount: number
  date: string
  paid_by: string
  status: "pending" | "paid"
  created_by: string
}

// Interfaz para los datos de distribución de gastos
interface ExpenseDistributionInput {
  client_id: number
  percentage: number
  amount: number
  status: "pending" | "paid"
}

// Función para crear un gasto administrativo
export async function createAdminExpense(
  expense: AdminExpenseInput,
  distributions: ExpenseDistributionInput[],
): Promise<AdminExpense> {
  try {
    console.log("Creando nuevo gasto administrativo:", expense)

    // Importar el cliente de Supabase directamente
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      throw new Error("No se pudo inicializar el cliente de Supabase")
    }

    // Insertar el gasto administrativo
    const { data: expenseData, error: expenseError } = await supabase
      .from("admin_expenses")
      .insert(expense)
      .select()
      .single()

    if (expenseError) {
      console.error("Error al crear gasto administrativo:", expenseError)
      throw expenseError
    }

    // Insertar las distribuciones del gasto
    const distributionsWithExpenseId = distributions.map((dist) => ({
      ...dist,
      expense_id: expenseData.id,
    }))

    const { error: distError } = await supabase.from("expense_distributions").insert(distributionsWithExpenseId)

    if (distError) {
      console.error("Error al crear distribuciones de gasto:", distError)
      throw distError
    }

    console.log("Gasto administrativo y distribuciones creados exitosamente")

    // Obtener los datos completos con las distribuciones
    const { data: fullExpenseData, error: fullExpenseError } = await supabase
      .from("admin_expenses")
      .select("*, expense_distributions(*, clients(name))")
      .eq("id", expenseData.id)
      .single()

    if (fullExpenseError) {
      console.error("Error al obtener el gasto administrativo completo:", fullExpenseError)
      // Devolver los datos parciales si no se pueden obtener los completos
      return {
        ...expenseData,
        expense_distributions: distributionsWithExpenseId.map((dist) => ({
          ...dist,
          clients: { name: "Cliente" }, // Nombre temporal
        })),
      }
    }

    return fullExpenseData
  } catch (error) {
    console.error("Error inesperado al crear gasto administrativo:", error)
    throw error
  }
}

// Función para actualizar el estado de un gasto
export async function updateExpenseStatus(expenseId: number, status: "pending" | "paid"): Promise<any> {
  try {
    console.log(`Actualizando estado de gasto ${expenseId} a ${status}...`)

    // Importar el cliente de Supabase directamente
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      throw new Error("No se pudo inicializar el cliente de Supabase")
    }

    // Actualizar el estado del gasto
    const { data, error } = await supabase
      .from("admin_expenses")
      .update({ status })
      .eq("id", expenseId)
      .select()
      .single()

    if (error) {
      console.error("Error al actualizar estado de gasto:", error)
      throw error
    }

    // Si el estado es "paid", actualizar también todas las distribuciones
    if (status === "paid") {
      // Obtener todas las distribuciones del gasto
      const { data: distributions, error: distError } = await supabase
        .from("expense_distributions")
        .select("id")
        .eq("expense_id", expenseId)

      if (distError) {
        console.error("Error al obtener distribuciones del gasto:", distError)
      } else if (distributions && distributions.length > 0) {
        // Actualizar todas las distribuciones a "paid"
        const { error: updateError } = await supabase
          .from("expense_distributions")
          .update({ status: "paid" })
          .eq("expense_id", expenseId)

        if (updateError) {
          console.error("Error al actualizar estado de distribuciones:", updateError)
        }
      }
    }

    console.log("Estado de gasto actualizado exitosamente:", data)
    return data
  } catch (error) {
    console.error("Error inesperado al actualizar estado de gasto:", error)
    throw error
  }
}

// Añadir la función para actualizar el estado de una distribución
export async function updateDistributionStatus(distributionId: number, status: "pending" | "paid"): Promise<any> {
  try {
    console.log(`Actualizando estado de distribución ${distributionId} a ${status}...`)

    // Importar el cliente de Supabase directamente
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      throw new Error("No se pudo inicializar el cliente de Supabase")
    }

    // Actualizar el estado de la distribución
    const { data, error } = await supabase
      .from("expense_distributions")
      .update({ status })
      .eq("id", distributionId)
      .select()
      .single()

    if (error) {
      console.error("Error al actualizar estado de distribución:", error)
      throw error
    }

    console.log("Estado de distribución actualizado exitosamente:", data)
    return data
  } catch (error) {
    console.error("Error inesperado al actualizar estado de distribución:", error)
    throw error
  }
}

// Función para exportar transacciones a CSV
export async function exportTransactionsToCSV(startDate: string, endDate: string) {
  try {
    console.log(`Exportando transacciones desde ${startDate} hasta ${endDate}...`)

    // Importar el cliente de Supabase directamente
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      throw new Error("No se pudo inicializar el cliente de Supabase")
    }

    // Obtener transacciones en el rango de fechas
    const { data, error } = await supabase
      .from("transactions")
      .select("*, clients(name)")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false })

    if (error) {
      console.error("Error al obtener transacciones para exportar:", error)
      throw error
    }

    // Convertir a CSV
    const headers = ["Fecha", "Cliente", "Tipo", "Monto", "Método de Pago", "Categoría", "Notas", "Creado Por"]
    const rows = data.map((tx) => [
      new Date(tx.date).toLocaleDateString("es-ES"),
      tx.clients?.name || "Desconocido",
      tx.type === "funding" ? "Fondeo" : tx.type === "expense" ? "Gasto" : "Leads",
      tx.amount.toString(),
      tx.payment_method || "",
      tx.category || "",
      tx.notes || "",
      tx.created_by,
    ])

    // Crear contenido CSV
    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    console.log("CSV generado exitosamente")
    return csvContent
  } catch (error) {
    console.error("Error inesperado al exportar transacciones a CSV:", error)
    throw error
  }
}

// Función para obtener las transacciones de un cliente específico
export async function getClientTransactions(clientName: string, startDate?: Date, endDate?: Date): Promise<any[]> {
  try {
    console.log(`Obteniendo transacciones para el cliente ${clientName}...`)

    // Importar el cliente de Supabase directamente
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      return []
    }

    // Usar fechas proporcionadas o predeterminadas
    const now = new Date()
    const firstDayOfMonth = startDate || new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Asegurarnos de que la fecha de inicio sea el inicio del día (00:00:00)
    const start = new Date(firstDayOfMonth)
    start.setHours(0, 0, 0, 0)

    // Asegurarnos de que la fecha final sea el final del día (23:59:59)
    const end = new Date(lastDayOfMonth)
    end.setHours(23, 59, 59, 999)

    // Obtener el ID del cliente
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("name", clientName)
      .single()

    if (clientError || !clientData) {
      console.error("Error al obtener el cliente:", clientError)
      return []
    }

    // Obtener las transacciones del cliente
    const { data, error } = await supabase
      .from("transactions")
      .select("id, date, type, amount, notes, payment_method, category")
      .eq("client_id", clientData.id)
      .gte("date", start.toISOString())
      .lte("date", end.toISOString())
      .order("date", { ascending: false })

    if (error) {
      console.error("Error al obtener transacciones del cliente:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error inesperado al obtener transacciones del cliente:", error)
    return []
  }
}

// Función para obtener los gastos administrativos de un cliente específico
export async function getClientAdminExpenses(clientName: string, startDate?: Date, endDate?: Date): Promise<any[]> {
  try {
    console.log(`Obteniendo gastos administrativos para el cliente ${clientName}...`)

    // Importar el cliente de Supabase directamente
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      return []
    }

    // Usar fechas proporcionadas o predeterminadas
    const now = new Date()
    const firstDayOfMonth = startDate || new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Asegurarnos de que la fecha de inicio sea el inicio del día (00:00:00)
    const start = new Date(firstDayOfMonth)
    start.setHours(0, 0, 0, 0)

    // Asegurarnos de que la fecha final sea el final del día (23:59:59)
    const end = new Date(lastDayOfMonth)
    end.setHours(23, 59, 59, 999)

    // Obtener el ID del cliente
    const { data: clientData, error: clientError } = await supabase
      .from("clients")
      .select("id")
      .eq("name", clientName)
      .single()

    if (clientError || !clientData) {
      console.error("Error al obtener el cliente:", clientError)
      return []
    }

    // Primero obtenemos las distribuciones para el cliente
    const { data: distributions, error: distError } = await supabase
      .from("expense_distributions")
      .select("id, expense_id, percentage, amount, status")
      .eq("client_id", clientData.id)

    if (distError) {
      console.error("Error al obtener distribuciones:", distError)
      return []
    }

    if (!distributions || distributions.length === 0) {
      return []
    }

    // Extraemos los IDs de los gastos administrativos
    const expenseIds = distributions.map((dist) => dist.expense_id)

    // Ahora obtenemos los detalles de los gastos administrativos
    const { data: expenses, error: expError } = await supabase
      .from("admin_expenses")
      .select("id, concept, date, amount, status")
      .in("id", expenseIds)
      .gte("date", start.toISOString())
      .lte("date", end.toISOString())
      .order("date", { ascending: false })

    if (expError) {
      console.error("Error al obtener gastos administrativos:", expError)
      return []
    }

    // Combinamos los datos de gastos y distribuciones
    const formattedData = expenses.map((expense) => {
      const distribution = distributions.find((dist) => dist.expense_id === expense.id)
      return {
        id: expense.id,
        date: expense.date,
        concept: expense.concept,
        amount: distribution ? distribution.amount : 0,
        status: distribution ? distribution.status : expense.status,
        percentage: distribution ? distribution.percentage : 0,
      }
    })

    return formattedData || []
  } catch (error) {
    console.error("Error inesperado al obtener gastos administrativos del cliente:", error)
    return []
  }
}
