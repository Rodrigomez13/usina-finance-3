// Importamos el tipo DateRange de react-day-picker para usarlo en toda la aplicación
import type { DateRange as ReactDayPickerDateRange } from "react-day-picker"

// Exportamos el tipo DateRange para usarlo en toda la aplicación
export type DateRange = ReactDayPickerDateRange

// Tipos básicos para las entidades principales
export interface Client {
  id: number
  name: string
  owner_id: number
  created_at: string
}

export interface ClientOwner {
  id: number
  name: string
  created_at?: string
}

// Update the ClientGroup interface to include the owner property
export interface ClientGroup {
  id: number
  name: string
  owner: string
  clients: Client[]
}

export interface FundingProvider {
  id: number
  name: string
  created_at?: string
}

export interface Transaction {
  id: number
  client_id: number
  type: "funding" | "expense" | "lead"
  amount: number
  date: string
  notes: string | null
  payment_method: string | null
  category: string | null
  cost_per_lead: number | null
  created_at: string
  created_by: string
  provider_id?: number | null
  payment_status?: "pending" | "paid"
  clients?: {
    name: string
  }
  provider?: {
    name: string
  }
}

export interface AdminExpense {
  id: number
  concept: string
  amount: number
  date: string
  paid_by: string
  status: "pending" | "paid"
  created_at: string
  created_by: string
  expense_distributions?: ExpenseDistribution[]
}

export interface ExpenseDistribution {
  id: number
  expense_id: number
  client_id: number
  percentage: number
  amount: number
  status: "pending" | "paid"
  created_at?: string
  clients?: {
    name: string
  }
}

export interface DashboardStats {
  totalLeads: number
  totalExpenses: number
  totalFunding: number
  balance: number
}

export interface ClientStats {
  [clientName: string]: {
    leads: number
    expenses: number
    funding: number
    balance: number
  }
}

// Tipos para los datos de demostración
export interface DemoData {
  clients: Client[]
  transactions: Transaction[]
  adminExpenses: AdminExpense[]
  clientGroups: ClientGroup[]
  clientStats: ClientStats
}

// Tipos para detalles de cliente
export interface ClientDetails {
  transactions: {
    id: number
    date: string
    type: "funding" | "expense" | "lead"
    amount: number
    notes: string | null
    provider_id?: number | null
    payment_status?: "pending" | "paid"
    provider?: {
      name: string
    }
  }[]
  adminExpenses: {
    id: number
    date: string
    concept: string
    amount: number
    status: "pending" | "paid"
  }[]
}

// Interfaz para el resumen mensual
export interface MonthlySummary {
  month: string
  leads: number
  expenses: number
  funding: number
  balance: number
}

// Interfaz para el resumen diario
export interface DailySummary {
  date: string
  cac: number
  leads: number
  expenses: number
  funding: number
  balance: number
  owner_id?: number | null
}

// Interfaz para los datos por dueño
export interface OwnerData {
  name: string
  dailySummaries: DailySummary[]
}

// Interfaz para el resumen diario de la base de datos
export interface DailySummaryRecord {
  id: number
  date: string
  owner_id: number | null
  cac: number
  leads: number
  expenses: number
  funding: number
  balance: number
  created_at: string
  updated_at: string
}

// Interfaces para inputs de creación
export interface AdminExpenseInput {
  concept: string
  amount: number
  date: string
  paid_by: string
  status: "pending" | "paid"
  created_by: string
}

export interface ExpenseDistributionInput {
  client_id: number
  percentage: number
  amount: number
  status: "pending" | "paid"
}
