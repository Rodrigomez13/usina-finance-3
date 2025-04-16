// Importar los tipos necesarios
import type { Transaction, AdminExpense, ClientGroup, ClientStats, DashboardStats } from "@/types/index"
// import { getRecentTransactions } from '@/lib/api';

// Función para detectar si estamos en el entorno de v0
const isV0Environment = () => {
  if (typeof window === "undefined") return false
  return window.location.hostname.includes("v0.dev")
}

// Función para obtener estadísticas del dashboard
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    console.log("Iniciando obtención de estadísticas del dashboard...")

    // Verificar si estamos en el entorno de v0
    if (isV0Environment()) {
      console.log("Detectado entorno v0.dev - usando datos de demostración")
      // Devolver datos de demostración para el entorno de v0
      return {
        totalLeads: 250,
        totalExpenses: 1500.75,
        totalFunding: 3000.5,
        balance: 1499.75,
      }
    }

    // Obtener el mes actual
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

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
        .gte("date", firstDayOfMonth)
        .lte("date", lastDayOfMonth)

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
        .gte("date", firstDayOfMonth)
        .lte("date", lastDayOfMonth)

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
        .gte("date", firstDayOfMonth)
        .lte("date", lastDayOfMonth)

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
export async function getRecentTransactions(): Promise<Transaction[]> {
  try {
    console.log("Obteniendo transacciones recientes...")

    // Verificar si estamos en el entorno de v0
    if (isV0Environment()) {
      console.log("Detectado entorno v0.dev - usando datos de demostración")
      // Devolver datos de demostración para el entorno de v0
      return [
        {
          id: 1,
          client_id: 1,
          type: "funding",
          amount: 1000,
          date: new Date().toISOString(),
          notes: "Fondeo inicial",
          payment_method: "transfer",
          category: null,
          cost_per_lead: null,
          created_at: new Date().toISOString(),
          created_by: "admin@example.com",
          clients: { name: "Fenix" },
        },
        {
          id: 2,
          client_id: 2,
          type: "expense",
          amount: 250.5,
          date: new Date().toISOString(),
          notes: "Publicidad en Facebook",
          payment_method: "transfer",
          category: "advertising",
          cost_per_lead: null,
          created_at: new Date().toISOString(),
          created_by: "admin@example.com",
          clients: { name: "Eros" },
        },
        {
          id: 3,
          client_id: 3,
          type: "lead",
          amount: 50,
          date: new Date().toISOString(),
          notes: "Leads de campaña de abril",
          payment_method: null,
          category: null,
          cost_per_lead: null,
          created_at: new Date().toISOString(),
          created_by: "admin@example.com",
          clients: { name: "Fortuna" },
        },
      ]
    }

    // Importar el cliente de Supabase directamente
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      return []
    }

    // Obtener las 5 transacciones más recientes
    const { data, error } = await supabase
      .from("transactions")
      .select("*, clients(name)")
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

    const { data, error } = await supabase.rpc("get_transactions_in_range", {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    });

    if (error) {
      console.error("Error al ejecutar SQL crudo:", error);
      return [];
    }

    return data;
  } catch (err) {
    console.error("Error general:", err);
    return [];
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

    // Verificar si estamos en el entorno de v0
    if (isV0Environment()) {
      console.log("Detectado entorno v0.dev - simulando creación de transacción")
      // Simular una respuesta exitosa
      return {
        ...transaction,
        id: Math.floor(Math.random() * 1000),
        payment_method: transaction.payment_method || null,
        category: transaction.category || null,
        cost_per_lead: transaction.cost_per_lead || null,
        created_at: new Date().toISOString(),
      }
    }

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

    // Verificar si estamos en el entorno de v0
    if (isV0Environment()) {
      console.log("Detectado entorno v0.dev - usando datos de demostración")
      // Devolver datos de demostración para el entorno de v0
      return [
        {
          id: 1,
          name: "Dueño 1",
          owner: "Dueño 1",
          clients: [
            { id: 1, name: "Fenix", owner_id: 1, created_at: "" },
            { id: 2, name: "Eros", owner_id: 1, created_at: "" },
          ],
        },
        {
          id: 2,
          name: "Dueño 2",
          owner: "Dueño 2",
          clients: [
            { id: 3, name: "Fortuna", owner_id: 2, created_at: "" },
            { id: 4, name: "Gana24", owner_id: 2, created_at: "" },
          ],
        },
        {
          id: 3,
          name: "Dueño 3",
          owner: "Dueño 3",
          clients: [{ id: 5, name: "Atenea", owner_id: 3, created_at: "" }],
        },
        {
          id: 4,
          name: "Dueño 4",
          owner: "Dueño 4",
          clients: [{ id: 6, name: "Flashbet", owner_id: 4, created_at: "" }],
        },
      ]
    }

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
// export async function getClientStats(): Promise<ClientStats> {
//   try {
//     console.log("Obteniendo estadísticas de clientes...")

//     // Verificar si estamos en el entorno de v0
//     if (isV0Environment()) {
//       console.log("Detectado entorno v0.dev - usando datos de demostración")
//       // Devolver datos de demostración para el entorno de v0
//       return {
//         Fenix: {
//           leads: 120,
//           expenses: 800.5,
//           funding: 1500.0,
//           balance: 699.5,
//         },
//         Eros: {
//           leads: 85,
//           expenses: 450.25,
//           funding: 1000.0,
//           balance: 549.75,
//         },
//         Fortuna: {
//           leads: 65,
//           expenses: 320.0,
//           funding: 800.0,
//           balance: 480.0,
//         },
//         Gana24: {
//           leads: 45,
//           expenses: 250.0,
//           funding: 600.0,
//           balance: 350.0,
//         },
//         Atenea: {
//           leads: 30,
//           expenses: 180.0,
//           funding: 400.0,
//           balance: 220.0,
//         },
//         Flashbet: {
//           leads: 20,
//           expenses: 150.0,
//           funding: 300.0,
//           balance: 150.0,
//         },
//       }
//     }

//     // Importar el cliente de Supabase directamente
//     const { getSupabaseClient } = await import("./supabase")
//     const supabase = getSupabaseClient()

//     if (!supabase) {
//       console.error("Error: Cliente Supabase no inicializado")
//       return {}
//     }

//     // Obtener todos los clientes
//     const { data: clients, error: clientsError } = await supabase.from("clients").select("id, name").order("name")

//     if (clientsError) {
//       console.error("Error al obtener clientes:", clientsError)
//       return {}
//     }

//     // Obtener todas las transacciones
//     const { data: transactions, error: transactionsError } = await supabase
//       .from("transactions")
//       .select("client_id, type, amount, clients(name)")

//     if (transactionsError) {
//       console.error("Error al obtener transacciones:", transactionsError)
//       return {}
//     }

//     // Calcular estadísticas por cliente
//     const stats: ClientStats = {}

//     // Inicializar estadísticas para cada cliente
//     clients.forEach((client) => {
//       stats[client.name] = {
//         leads: 0,
//         expenses: 0,
//         funding: 0,
//         balance: 0,
//       }
//     })

//     // Calcular estadísticas basadas en transacciones
//     transactions.forEach((tx) => {
//       const clientName = tx.clients?.name
//       if (!clientName || !stats[clientName]) return

//       if (tx.type === "lead") {
//         stats[clientName].leads += tx.amount || 0
//       } else if (tx.type === "expense") {
//         stats[clientName].expenses += tx.amount || 0
//       } else if (tx.type === "funding") {
//         stats[clientName].funding += tx.amount || 0
//       }
//     })

//     // Calcular balance para cada cliente
//     Object.keys(stats).forEach((clientName) => {
//       stats[clientName].balance = stats[clientName].funding - stats[clientName].expenses
//     })

//     console.log("Estadísticas de clientes calculadas")
//     return stats
//   } catch (error) {
//     console.error("Error inesperado al obtener estadísticas de clientes:", error)
//     return {}
//   }
// }

// Función para obtener la lista de clientes
export async function getClients() {
  try {
    console.log("Obteniendo lista de clientes...")

    // Verificar si estamos en el entorno de v0
    if (isV0Environment()) {
      console.log("Detectado entorno v0.dev - usando datos de demostración")
      // Devolver datos de demostración para el entorno de v0
      return [
        { id: 1, name: "Fenix" },
        { id: 2, name: "Eros" },
        { id: 3, name: "Fortuna" },
        { id: 4, name: "Gana24" },
        { id: 5, name: "Atenea" },
        { id: 6, name: "Flashbet" },
      ]
    }

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
export async function getAdminExpenses(): Promise<AdminExpense[]> {
  try {
    console.log("Obteniendo gastos administrativos...")

    // Verificar si estamos en el entorno de v0
    if (isV0Environment()) {
      console.log("Detectado entorno v0.dev - usando datos de demostración")
      // Devolver datos de demostración para el entorno de v0
      return [
        {
          id: 1,
          concept: "Alquiler de oficina",
          amount: 500,
          date: new Date().toISOString(),
          paid_by: "shared",
          status: "pending",
          created_at: new Date().toISOString(),
          created_by: "admin@example.com",
          expense_distributions: [
            {
              id: 1,
              expense_id: 1,
              client_id: 1,
              percentage: 30,
              amount: 150,
              status: "pending",
              clients: { name: "Fenix" },
            },
            {
              id: 2,
              expense_id: 1,
              client_id: 2,
              percentage: 25,
              amount: 125,
              status: "pending",
              clients: { name: "Eros" },
            },
            {
              id: 3,
              expense_id: 1,
              client_id: 3,
              percentage: 15,
              amount: 75,
              status: "pending",
              clients: { name: "Fortuna" },
            },
            {
              id: 4,
              expense_id: 1,
              client_id: 4,
              percentage: 15,
              amount: 75,
              status: "pending",
              clients: { name: "Gana24" },
            },
            {
              id: 5,
              expense_id: 1,
              client_id: 5,
              percentage: 10,
              amount: 50,
              status: "pending",
              clients: { name: "Atenea" },
            },
            {
              id: 6,
              expense_id: 1,
              client_id: 6,
              percentage: 5,
              amount: 25,
              status: "pending",
              clients: { name: "Flashbet" },
            },
          ],
        },
        {
          id: 2,
          concept: "Servicios de internet",
          amount: 100,
          date: new Date().toISOString(),
          paid_by: "shared",
          status: "paid",
          created_at: new Date().toISOString(),
          created_by: "admin@example.com",
          expense_distributions: [
            {
              id: 7,
              expense_id: 2,
              client_id: 1,
              percentage: 30,
              amount: 30,
              status: "paid",
              clients: { name: "Fenix" },
            },
            {
              id: 8,
              expense_id: 2,
              client_id: 2,
              percentage: 25,
              amount: 25,
              status: "paid",
              clients: { name: "Eros" },
            },
            {
              id: 9,
              expense_id: 2,
              client_id: 3,
              percentage: 15,
              amount: 15,
              status: "paid",
              clients: { name: "Fortuna" },
            },
            {
              id: 10,
              expense_id: 2,
              client_id: 4,
              percentage: 15,
              amount: 15,
              status: "paid",
              clients: { name: "Gana24" },
            },
            {
              id: 11,
              expense_id: 2,
              client_id: 5,
              percentage: 10,
              amount: 10,
              status: "paid",
              clients: { name: "Atenea" },
            },
            {
              id: 12,
              expense_id: 2,
              client_id: 6,
              percentage: 5,
              amount: 5,
              status: "paid",
              clients: { name: "Flashbet" },
            },
          ],
        },
      ]
    }

    // Importar el cliente de Supabase directamente
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      return []
    }

    // Obtener gastos administrativos con sus distribuciones
    const { data, error } = await supabase
      .from("admin_expenses")
      .select("*, expense_distributions(*, clients(name))")
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

    // Verificar si estamos en el entorno de v0
    if (isV0Environment()) {
      console.log("Detectado entorno v0.dev - simulando creación de gasto administrativo")
      // Simular una respuesta exitosa
      return {
        ...expense,
        id: Math.floor(Math.random() * 1000),
        created_at: new Date().toISOString(),
        expense_distributions: distributions.map((dist, index) => ({
          ...dist,
          id: index + 1,
          expense_id: Math.floor(Math.random() * 1000),
          clients: { name: `Cliente ${dist.client_id}` },
        })),
      }
    }

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
    return {
      ...expenseData,
      expense_distributions: distributionsWithExpenseId.map((dist, index) => ({
        ...dist,
        id: index + 1, // ID temporal
        clients: { name: `Cliente ${dist.client_id}` }, // Nombre temporal
      })),
    }
  } catch (error) {
    console.error("Error inesperado al crear gasto administrativo:", error)
    throw error
  }
}

// Función para actualizar el estado de un gasto
export async function updateExpenseStatus(expenseId: number, status: "pending" | "paid"): Promise<any> {
  try {
    console.log(`Actualizando estado de gasto ${expenseId} a ${status}...`)

    // Verificar si estamos en el entorno de v0
    if (isV0Environment()) {
      console.log("Detectado entorno v0.dev - simulando actualización de estado")
      // Simular una respuesta exitosa
      return {
        id: expenseId,
        status,
        updated_at: new Date().toISOString(),
      }
    }

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

    console.log("Estado de gasto actualizado exitosamente:", data)
    return data
  } catch (error) {
    console.error("Error inesperado al actualizar estado de gasto:", error)
    throw error
  }
}

// Función para exportar transacciones a CSV
export async function exportTransactionsToCSV(startDate: string, endDate: string) {
  try {
    console.log(`Exportando transacciones desde ${startDate} hasta ${endDate}...`)

    // Verificar si estamos en el entorno de v0
    if (isV0Environment()) {
      console.log("Detectado entorno v0.dev - generando CSV de demostración")

      // Crear contenido CSV de demostración
      const headers = ["Fecha", "Cliente", "Tipo", "Monto", "Método de Pago", "Categoría", "Notas", "Creado Por"]
      const rows = [
        ["2025-04-01", "Fenix", "Fondeo", "1000.00", "Transferencia", "", "Fondeo inicial", "admin@example.com"],
        [
          "2025-04-02",
          "Eros",
          "Gasto",
          "250.50",
          "Transferencia",
          "Publicidad",
          "Publicidad en Facebook",
          "admin@example.com",
        ],
        ["2025-04-03", "Fortuna", "Leads", "50", "", "", "Leads de campaña de abril", "admin@example.com"],
      ]

      // Crear contenido CSV
      const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

      console.log("CSV generado exitosamente")
      return csvContent
    }

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
