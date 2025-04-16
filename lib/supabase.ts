import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Asegurarnos de que las variables de entorno estén definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Verificar que las variables de entorno estén disponibles
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Error: Variables de entorno de Supabase no definidas. Asegúrate de que NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY estén configuradas.",
  )
}

// Almacenar la instancia del cliente
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

// Función para obtener la instancia única del cliente de Supabase
export function getSupabaseClient() {
  // Si ya existe una instancia, devolverla
  if (supabaseInstance) {
    return supabaseInstance
  }

  // Si no hay URL o clave, no se puede crear el cliente
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("No se puede crear el cliente Supabase: faltan variables de entorno")
    return null
  }

  try {
    console.log("Creando instancia única del cliente Supabase...")

    // Crear el cliente con opciones específicas
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        // Usar un storage key fijo para evitar problemas de múltiples instancias
        storageKey: "finance-management-auth",
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    })

    console.log("Cliente Supabase creado exitosamente")
    return supabaseInstance
  } catch (error) {
    console.error("Error al crear cliente Supabase:", error)
    return null
  }
}

// Exportar el cliente de Supabase como una instancia única
export const supabase = getSupabaseClient()

// Función para verificar la conexión con reintentos
export async function checkSupabaseConnection() {
  try {
    // Obtener la instancia del cliente (asegura que existe una única instancia)
    const client = getSupabaseClient()

    if (!client) {
      console.error("❌ Cliente Supabase no inicializado")
      return false
    }

    console.log("Verificando conexión con Supabase...")
    console.log("URL:", supabaseUrl?.substring(0, 20) + "...")
    console.log("Key disponible:", !!supabaseAnonKey)

    // Intentar una consulta simple para verificar la conexión con reintentos
    let attempts = 0
    const maxAttempts = 3

    while (attempts < maxAttempts) {
      try {
        // Usar una consulta más simple para verificar la conexión
        const { data, error } = await client.from("clients").select("count").limit(1).maybeSingle()

        if (error) {
          console.error(`❌ Error de conexión a Supabase (intento ${attempts + 1}/${maxAttempts}):`, error.message)
          attempts++

          if (attempts < maxAttempts) {
            console.log(`Reintentando en ${attempts * 2} segundos...`)
            await new Promise((resolve) => setTimeout(resolve, attempts * 2000))
            continue
          }
          return false
        }

        console.log("✅ Conexión a Supabase exitosa")
        return true
      } catch (error) {
        console.error(`❌ Error al verificar la conexión (intento ${attempts + 1}/${maxAttempts}):`, error)
        attempts++

        if (attempts < maxAttempts) {
          console.log(`Reintentando en ${attempts * 2} segundos...`)
          await new Promise((resolve) => setTimeout(resolve, attempts * 2000))
        } else {
          return false
        }
      }
    }

    return false
  } catch (error) {
    console.error("❌ Error inesperado al verificar la conexión con Supabase:", error)
    return false
  }
}

// Función para reiniciar el cliente de Supabase si es necesario
export function resetSupabaseClient() {
  if (supabaseInstance) {
    console.log("Reseteando instancia del cliente Supabase...")
    supabaseInstance = null
  }
  return getSupabaseClient()
}
