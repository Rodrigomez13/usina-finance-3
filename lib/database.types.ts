export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: number
          name: string
          owner_id: number | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          owner_id?: number | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          owner_id?: number | null
          created_at?: string
        }
      }
      client_owners: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          created_at?: string
        }
      }
      transactions: {
        Row: {
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
        }
        Insert: {
          id?: number
          client_id: number
          type: "funding" | "expense" | "lead"
          amount: number
          date: string
          notes?: string | null
          payment_method?: string | null
          category?: string | null
          cost_per_lead?: number | null
          created_at?: string
          created_by: string
        }
        Update: {
          id?: number
          client_id?: number
          type?: "funding" | "expense" | "lead"
          amount?: number
          date?: string
          notes?: string | null
          payment_method?: string | null
          category?: string | null
          cost_per_lead?: number | null
          created_at?: string
          created_by?: string
        }
      }
      admin_expenses: {
        Row: {
          id: number
          concept: string
          amount: number
          date: string
          paid_by: string
          status: "pending" | "paid"
          created_at: string
          created_by: string
        }
        Insert: {
          id?: number
          concept: string
          amount: number
          date: string
          paid_by: string
          status?: "pending" | "paid"
          created_at?: string
          created_by: string
        }
        Update: {
          id?: number
          concept?: string
          amount?: number
          date?: string
          paid_by?: string
          status?: "pending" | "paid"
          created_at?: string
          created_by?: string
        }
      }
      expense_distributions: {
        Row: {
          id: number
          expense_id: number
          client_id: number
          percentage: number
          amount: number
          status: "pending" | "paid"
          created_at: string
        }
        Insert: {
          id?: number
          expense_id: number
          client_id: number
          percentage: number
          amount: number
          status?: "pending" | "paid"
          created_at?: string
        }
        Update: {
          id?: number
          expense_id?: number
          client_id?: number
          percentage?: number
          amount?: number
          status?: "pending" | "paid"
          created_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]
export type InsertTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]
export type UpdateTables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
