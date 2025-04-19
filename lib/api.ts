// Importar los tipos necesarios
import type { Transaction, AdminExpense, ClientGroup, ClientStats, DashboardStats } from "@/types/index"
import { apiCache } from "./cache"

// Función para detectar si estamos en el entorno de v0
const isV0Environment = () => {
  if (typeof window === "undefined") return false
  return window.location.hostname.includes("v0.dev")
}

// Función para obtener estadísticas del dashboard
export async function getDashboardStats(
  startDate: Date = new Date(2025, 3, 1),
  endDate: Date = new Date(),
): Promise<DashboardStats> {
  const cacheKey = `dashboard_stats_${startDate.toISOString()}_${endDate.toISOString()}`

  return apiCache.get<DashboardStats>(
    cacheKey,
    async () => {
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

        // Usar la función de la base de datos para obtener estadísticas
        const { data, error } = await supabase.rpc("get_dashboard_stats", {
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
        })

        if (error) {
          console.error("Error al obtener estadísticas del dashboard:", error)
          throw error
        }

        // Si no hay datos, devolver valores por defecto
        if (!data || data.length === 0) {
          return {
            totalLeads: 0,
            totalExpenses: 0,
            totalFunding: 0,
            balance: 0,
          }
        }

        // Extraer los datos de la respuesta
        const stats = data[0]
        return {
          totalLeads: Number(stats.total_leads) || 0,
          totalExpenses: Number(stats.total_expenses) || 0,
          totalFunding: Number(stats.total_funding) || 0,
          balance: Number(stats.balance) || 0,
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
    },
    { expiry: 30 * 60 * 1000 }, // 30 minutos de caché
  )
}

// Función para obtener transacciones recientes
export async function getRecentTransactions(
  startDate: Date = new Date(2025, 3, 1),
  endDate: Date = new Date(),
  limit = 5,
): Promise<Transaction[]> {
  const cacheKey = `recent_transactions_${startDate.toISOString()}_${endDate.toISOString()}_${limit}`

  return apiCache.get<Transaction[]>(
    cacheKey,
    async () => {
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

        // Ajustar fechas para UTC
        const formattedStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000)
          .toISOString()
          .split("T")[0]
        const formattedEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000)
          .toISOString()
          .split("T")[0]

        console.log(`Fechas ajustadas para UTC: ${formattedStartDate} a ${formattedEndDate}`)

        // Usar la función de la base de datos para obtener transacciones recientes
        const { data, error } = await supabase.rpc("get_recent_transactions", {
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          limit_count: limit,
        })

        if (error) {
          console.error("Error al obtener transacciones recientes:", error)
          return []
        }

        // Transformar los datos para que coincidan con el tipo Transaction
        const transactions = data.map((tx: any) => ({
          id: tx.id,
          client_id: tx.client_id,
          type: tx.type,
          amount: tx.amount,
          date: tx.date,
          notes: tx.notes,
          payment_method: tx.payment_method,
          category: tx.category,
          cost_per_lead: tx.cost_per_lead,
          created_at: tx.created_at,
          created_by: tx.created_by,
          clients: { name: tx.client_name },
        }))

        console.log(`Transacciones recientes obtenidas: ${transactions.length} registros`)
        return transactions
      } catch (error) {
        console.error("Error inesperado al obtener transacciones recientes:", error)
        return []
      }
    },
    { expiry: 15 * 60 * 1000 }, // 15 minutos de caché
  )
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
export async function getClientStats(
  startDate: Date = new Date(2025, 3, 1),
  endDate: Date = new Date(),
): Promise<ClientStats> {
  const cacheKey = `client_stats_${startDate.toISOString()}_${endDate.toISOString()}`

  return apiCache.get<ClientStats>(
    cacheKey,
    async () => {
      try {
        console.log("Obteniendo estadísticas de clientes...")

        // Verificar si estamos en el entorno de v0
        if (isV0Environment()) {
          console.log("Detectado entorno v0.dev - usando datos de demostración")
          // Devolver datos de demostración para el entorno de v0
          return {
            Fenix: {
              leads: 120,
              expenses: 800.5,
              funding: 1500.0,
              balance: 699.5,
            },
            Eros: {
              leads: 85,
              expenses: 450.25,
              funding: 1000.0,
              balance: 549.75,
            },
            Fortuna: {
              leads: 65,
              expenses: 320.0,
              funding: 800.0,
              balance: 480.0,
            },
            Gana24: {
              leads: 45,
              expenses: 250.0,
              funding: 600.0,
              balance: 350.0,
            },
            Atenea: {
              leads: 30,
              expenses: 180.0,
              funding: 400.0,
              balance: 220.0,
            },
            Flashbet: {
              leads: 20,
              expenses: 150.0,
              funding: 300.0,
              balance: 150.0,
            },
          }
        }

        // Importar el cliente de Supabase directamente
        const { getSupabaseClient } = await import("./supabase")
        const supabase = getSupabaseClient()

        if (!supabase) {
          console.error("Error: Cliente Supabase no inicializado")
          return {}
        }

        // Usar la función de la base de datos para obtener estadísticas por cliente
        const { data, error } = await supabase.rpc("get_client_stats", {
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
        })

        if (error) {
          console.error("Error al obtener estadísticas de clientes:", error)
          return {}
        }

        // Transformar los datos al formato esperado
        const stats: ClientStats = {}
        data.forEach((item: any) => {
          stats[item.client_name] = {
            leads: Number(item.leads) || 0,
            expenses: Number(item.expenses) || 0,
            funding: Number(item.funding) || 0,
            balance: Number(item.balance) || 0,
          }
        })

        console.log("Estadísticas de clientes calculadas")
        return stats
      } catch (error) {
        console.error("Error inesperado al obtener estadísticas de clientes:", error)
        return {}
      }
    },
    { expiry: 30 * 60 * 1000 }, // 30 minutos de caché
  )
}

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

// lib/api.ts - Función actualizada
export async function getDailyClientSummary(startDate: Date, endDate: Date): Promise<any[]> {
  try {
    // Para depuración
    console.log(`Obteniendo resumen diario: ${startDate.toISOString()} a ${endDate.toISOString()}`)

    // Verificar si estamos en el entorno de v0
    if (typeof window !== "undefined" && window.location.hostname.includes("v0.dev")) {
      console.log("Usando datos de demostración en v0")
      // Devolver datos de demostración (código existente)
      return getDemoClientSummary(startDate, endDate)
    }

    // Importar el cliente de Supabase
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      return []
    }

    // Formatear fechas correctamente ajustando la zona horaria
    const formattedStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0]
    const formattedEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0]

    console.log(`Fechas ajustadas para UTC: ${formattedStartDate} a ${formattedEndDate}`)

    // Llamar a la función RPC
    try {
      const { data, error } = await supabase.rpc("get_daily_client_summary", {
        start_date: formattedStartDate,
        end_date: formattedEndDate,
      })

      if (error) {
        console.error("Error RPC:", error)
        throw error
      }

      console.log(`Datos obtenidos: ${data?.length || 0} registros`)
      return data || []
    } catch (rpcError) {
      console.error("Error al llamar RPC:", rpcError)

      // Implementar consulta directa como fallback
      console.log("Intentando consulta directa como fallback...")

      // Aquí puedes implementar una consulta directa a la tabla o vista
      try {
        const fallbackData = await getFallbackClientSummary(supabase, startDate, endDate)
        console.log(`Datos obtenidos por fallback: ${fallbackData?.length || 0} registros`)
        return fallbackData
      } catch (fallbackError) {
        console.error("Error en fallback:", fallbackError)
        return []
      }
    }
  } catch (error) {
    console.error("Error general:", error)
    return []
  }
}

// Fallback function using direct queries
async function getFallbackClientSummary(supabase: any, startDate: Date, endDate: Date): Promise<any[]> {
  try {
    // Get all clients
    const { data: clients } = await supabase.from("clients").select("id, name").order("name")

    if (!clients || clients.length === 0) {
      return []
    }

    // Get transactions in date range
    const { data: transactions } = await supabase
      .from("transactions")
      .select("date, client_id, type, amount")
      .gte("date", startDate.toISOString())
      .lte("date", endDate.toISOString())

    if (!transactions || transactions.length === 0) {
      // Return empty data for each client and date
      return generateEmptyData(clients, startDate, endDate)
    }

    // Process the data manually
    return processTransactionData(clients, transactions, startDate, endDate)
  } catch (error) {
    console.error("Error in fallback query:", error)
    throw error
  }
}

// Helper function to process transaction data
function processTransactionData(clients: any[], transactions: any[], startDate: Date, endDate: Date): any[] {
  // Create a map to store data by date and client
  const dataMap: Record<string, Record<number, any>> = {}

  // Generate all dates in range
  const dates: Date[] = []
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Initialize data structure
  dates.forEach((date) => {
    const dateStr = date.toISOString().split("T")[0]
    dataMap[dateStr] = {}

    clients.forEach((client) => {
      dataMap[dateStr][client.id] = {
        date: dateStr,
        client_id: client.id,
        client_name: client.name,
        leads: 0,
        expenses: 0,
        funding: 0,
        balance: 0,
      }
    })
  })

  // Process transactions
  transactions.forEach((tx) => {
    const dateStr = new Date(tx.date).toISOString().split("T")[0]
    const clientId = tx.client_id

    if (dataMap[dateStr] && dataMap[dateStr][clientId]) {
      if (tx.type === "lead") {
        dataMap[dateStr][clientId].leads += tx.amount ?? 0
      } else if (tx.type === "expense") {
        dataMap[dateStr][clientId].expenses += tx.amount ?? 0
      } else if (tx.type === "funding") {
        dataMap[dateStr][clientId].funding += tx.amount ?? 0
      }
    }
  })

  // Calculate balances and flatten the data
  const result: any[] = []
  Object.keys(dataMap).forEach((dateStr) => {
    Object.keys(dataMap[dateStr]).forEach((clientId) => {
      const record = dataMap[dateStr][Number(clientId)]
      record.balance = record.funding - record.expenses
      result.push(record)
    })
  })

  return result
}

// Helper function to generate empty data
function generateEmptyData(clients: any[], startDate: Date, endDate: Date): any[] {
  const result: any[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0]

    clients.forEach((client) => {
      result.push({
        date: dateStr,
        client_id: client.id,
        client_name: client.name,
        leads: 0,
        expenses: 0,
        funding: 0,
        balance: 0,
      })
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return result
}

// Demo data generator for v0 environment
function getDemoClientSummary(startDate: Date, endDate: Date): any[] {
  const clients = [
    { id: 1, name: "Fenix" },
    { id: 2, name: "Eros" },
    { id: 3, name: "Fortuna" },
    { id: 4, name: "Gana24" },
  ]

  const result: any[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split("T")[0]
    const dayOfMonth = currentDate.getDate()

    clients.forEach((client) => {
      // Generate somewhat realistic random data based on client and date
      const leads = Math.floor(Math.random() * 20) + 5
      const expenses = Math.round((Math.random() * 200 + 50) * 100) / 100
      const funding = dayOfMonth % 5 === 0 ? Math.round((Math.random() * 500 + 200) * 100) / 100 : 0
      const balance = funding - expenses

      result.push({
        date: dateStr,
        client_id: client.id,
        client_name: client.name,
        leads,
        expenses,
        funding,
        balance,
      })
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return result
}

// Función para obtener transacciones de un cliente específico
export async function getClientTransactions(clientId: number, startDate: Date, endDate: Date): Promise<any[]> {
  try {
    console.log(
      `Obteniendo transacciones del cliente ${clientId} desde ${startDate.toISOString()} hasta ${endDate.toISOString()}...`,
    )

    // Verificar si estamos en el entorno de v0
    if (typeof window !== "undefined" && window.location.hostname.includes("v0.dev")) {
      console.log("Detectado entorno v0.dev - usando datos de demostración")
      // Devolver datos de demostración para el entorno de v0
      return [
        {
          id: 1,
          date: new Date().toISOString(),
          type: "funding",
          amount: 1000,
          notes: "Fondeo inicial",
        },
        {
          id: 2,
          date: new Date(Date.now() - 86400000).toISOString(), // Ayer
          type: "expense",
          amount: 250.5,
          notes: "Publicidad en Facebook",
        },
        {
          id: 3,
          date: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
          type: "lead",
          amount: 50,
          notes: "Leads de campaña de abril",
        },
      ]
    }

    // Importar el cliente de Supabase
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      return []
    }

    // Formatear fechas correctamente ajustando la zona horaria
    const formattedStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0]
    const formattedEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0]

    console.log(`Fechas ajustadas para UTC: ${formattedStartDate} a ${formattedEndDate}`)

    // Obtener transacciones del cliente
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("client_id", clientId)
      .gte("date", formattedStartDate)
      .lte("date", formattedEndDate)
      .order("date", { ascending: false })

    if (error) {
      console.error("Error al obtener transacciones del cliente:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error general:", error)
    return []
  }
}

// Modificar la función getClientAdminExpenses para corregir el problema de tipos
export async function getClientAdminExpenses(clientId: number, startDate: Date, endDate: Date): Promise<any[]> {
  try {
    console.log(
      `Obteniendo gastos administrativos del cliente ${clientId} desde ${startDate.toISOString()} hasta ${endDate.toISOString()}...`,
    )

    // Verificar si estamos en el entorno de v0
    if (typeof window !== "undefined" && window.location.hostname.includes("v0.dev")) {
      console.log("Detectado entorno v0.dev - usando datos de demostración")
      // Devolver datos de demostración para el entorno de v0
      return [
        {
          id: 1,
          expense_id: 1,
          concept: "Alquiler de oficina",
          date: new Date().toISOString(),
          amount: 150,
          status: "pending",
        },
        {
          id: 2,
          expense_id: 2,
          concept: "Servicios de internet",
          date: new Date(Date.now() - 86400000).toISOString(), // Ayer
          amount: 30,
          status: "paid",
        },
      ]
    }

    // Importar el cliente de Supabase
    const { getSupabaseClient } = await import("./supabase")
    const supabase = getSupabaseClient()

    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado")
      return []
    }

    // Formatear fechas correctamente - Usar UTC para evitar problemas de zona horaria
    const formattedStartDate = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0]
    const formattedEndDate = new Date(endDate.getTime() - endDate.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0]

    console.log(`Fechas ajustadas para UTC: ${formattedStartDate} a ${formattedEndDate}`)

    // Obtener gastos administrativos del cliente - CORREGIDO: eliminamos el ordenamiento problemático
    const { data, error } = await supabase
      .from("expense_distributions")
      .select(`
        id,
        expense_id,
        amount,
        percentage,
        status,
        admin_expenses (
          id,
          concept,
          date,
          status
        )
      `)
      .eq("client_id", clientId)
      .gte("admin_expenses.date", formattedStartDate)
      .lte("admin_expenses.date", formattedEndDate)

    if (error) {
      console.error("Error al obtener gastos administrativos del cliente:", error)
      throw error
    }

    // Transformar los datos para que sean más fáciles de usar
    const formattedData =
      data?.map((item) => ({
        id: item.id,
        expense_id: item.expense_id,
        concept: item.admin_expenses?.concept ?? "Gasto administrativo",
        date: item.admin_expenses?.date ?? new Date().toISOString(),
        amount: item.amount,
        status: item.status,
      })) || []

    return formattedData
  } catch (error) {
    console.error("Error general:", error)
    return []
  }
}

// Función para actualizar el estado de una distribución de gasto
export async function updateExpenseDistributionStatus(
  distributionId: number,
  status: "pending" | "paid",
): Promise<any> {
  try {
    console.log(`Actualizando estado de distribución ${distributionId} a ${status}...`)

    // Verificar si estamos en el entorno de v0
    if (typeof window !== "undefined" && window.location.hostname.includes("v0.dev")) {
      console.log("Detectado entorno v0.dev - simulando actualización de estado")
      // Simular una respuesta exitosa
      return {
        id: distributionId,
        status,
        updated_at: new Date().toISOString(),
      }
    }

    // Importar el cliente de Supabase
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

    // Crear una transacción para este gasto administrativo
    if (status === "paid") {
      try {
        // Obtener detalles de la distribución
        const { data: distData } = await supabase
          .from("expense_distributions")
          .select(`
            client_id,
            amount,
            admin_expenses (
              concept,
              date
            )
          `)
          .eq("id", distributionId)
          .single()

        if (distData) {
          // Crear una transacción de tipo gasto
          await supabase.from("transactions").insert({
            client_id: distData.client_id,
            type: "expense",
            amount: distData.amount,
            date: distData.admin_expenses?.date ?? new Date().toISOString(),
            notes: `Gasto administrativo: ${distData.admin_expenses?.concept ?? "Sin concepto"}`,
            category: "admin",
            created_by: "sistema",
          })
        }
      } catch (txError) {
        console.error("Error al crear transacción para gasto administrativo:", txError)
        // No interrumpir el flujo si falla la creación de la transacción
      }
    }

    console.log("Estado de distribución actualizado exitosamente:", data)
    return data
  } catch (error) {
    console.error("Error inesperado al actualizar estado de distribución:", error)
    throw error
  }
}
