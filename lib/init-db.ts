"use server"

import { supabase } from "./supabase"

interface ClientOwner {
  name: string
  id?: number
}

interface Client {
  name: string
  owner_id: number
}

export async function initializeDatabase() {
  try {
    // Crear tabla de propietarios de clientes
    await supabase.rpc("create_client_owners_if_not_exists")

    // Crear tabla de clientes
    await supabase.rpc("create_clients_if_not_exists")

    // Crear tabla de transacciones
    await supabase.rpc("create_transactions_if_not_exists")

    // Crear tabla de gastos administrativos
    await supabase.rpc("create_admin_expenses_if_not_exists")

    // Crear tabla de distribuciones de gastos
    await supabase.rpc("create_expense_distributions_if_not_exists")

    // Insertar datos iniciales
    await insertInitialData()

    return { success: true }
  } catch (error) {
    console.error("Error initializing database:", error)
    return { success: false, error }
  }
}

async function insertInitialData() {
  // Insertar propietarios de clientes
  const { data: owners } = await supabase.from("client_owners").select("id")

  if (!owners || owners.length === 0) {
    await supabase
      .from("client_owners")
      .insert([{ name: "Dueño 1" }, { name: "Dueño 2" }, { name: "Dueño 3" }, { name: "Dueño 4" }])

    // Obtener los IDs de los propietarios insertados
    const { data: insertedOwners } = await supabase.from("client_owners").select("id, name")

    if (insertedOwners) {
      // Mapear propietarios por nombre
      const ownerMap: Record<string, number> = insertedOwners.reduce(
        (acc: Record<string, number>, owner: ClientOwner) => {
          if (owner.id !== undefined) {
            acc[owner.name] = owner.id
          }
          return acc
        },
        {},
      )

      // Insertar clientes
      const clientsToInsert: Client[] = [
        { name: "Fenix", owner_id: ownerMap["Dueño 1"] },
        { name: "Eros", owner_id: ownerMap["Dueño 1"] },
        { name: "Fortuna", owner_id: ownerMap["Dueño 2"] },
        { name: "Gana24", owner_id: ownerMap["Dueño 2"] },
        { name: "Atenea", owner_id: ownerMap["Dueño 3"] },
        { name: "Flashbet", owner_id: ownerMap["Dueño 4"] },
      ]

      await supabase.from("clients").insert(clientsToInsert)
    }
  }
}
