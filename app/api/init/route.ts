import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

interface ClientOwner {
  id: number
  name: string
}

export async function GET() {
  try {
    // Crear tablas básicas
    await supabase.rpc("create_tables_if_not_exist")

    // Insertar datos iniciales
    const { data: owners } = await supabase.from("client_owners").select("id")

    if (!owners || owners.length === 0) {
      // Insertar propietarios
      await supabase
        .from("client_owners")
        .insert([{ name: "Dueño 1" }, { name: "Dueño 2" }, { name: "Dueño 3" }, { name: "Dueño 4" }])

      // Obtener los IDs insertados
      const { data: insertedOwners } = await supabase.from("client_owners").select("id, name")

      if (insertedOwners && insertedOwners.length > 0) {
        const ownerMap: Record<string, number> = {}
        insertedOwners.forEach((owner: ClientOwner) => {
          ownerMap[owner.name] = owner.id
        })

        // Insertar clientes
        await supabase.from("clients").insert([
          { name: "Fenix", owner_id: ownerMap["Dueño 1"] },
          { name: "Eros", owner_id: ownerMap["Dueño 1"] },
          { name: "Fortuna", owner_id: ownerMap["Dueño 2"] },
          { name: "Gana24", owner_id: ownerMap["Dueño 2"] },
          { name: "Atenea", owner_id: ownerMap["Dueño 3"] },
          { name: "Flashbet", owner_id: ownerMap["Dueño 4"] },
        ])
      }
    }

    return NextResponse.json({ success: true, message: "Database initialized successfully" })
  } catch (error: any) {
    console.error("Error initializing database:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
