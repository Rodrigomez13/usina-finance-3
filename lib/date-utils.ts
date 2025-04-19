import { format, parseISO, subDays, startOfMonth, endOfMonth, differenceInDays, isValid } from "date-fns"
import { es } from "date-fns/locale"

// Función para formatear fechas con localización española
export function formatDate(date: Date | string, formatStr = "dd/MM/yyyy"): string {
  if (!date) return ""

  const dateObj = typeof date === "string" ? parseISO(date) : date

  if (!isValid(dateObj)) return "Fecha inválida"

  return format(dateObj, formatStr, { locale: es })
}

// Función para ajustar la zona horaria para Supabase (UTC)
export function toUTCDate(date: Date): Date {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
}

// Función para convertir fecha a formato ISO sin componente de tiempo
export function toISODateString(date: Date): string {
  return toUTCDate(date).toISOString().split("T")[0]
}

// Función para obtener el primer y último día del mes actual
export function getCurrentMonthRange(): { from: Date; to: Date } {
  const today = new Date()
  return {
    from: startOfMonth(today),
    to: endOfMonth(today),
  }
}

// Función para obtener el primer y último día del mes anterior
export function getPreviousMonthRange(): { from: Date; to: Date } {
  const today = new Date()
  const previousMonth = new Date(today.getFullYear(), today.getMonth() - 1)
  return {
    from: startOfMonth(previousMonth),
    to: endOfMonth(previousMonth),
  }
}

// Función para obtener un rango de fechas personalizado
export function getDateRange(days: number): { from: Date; to: Date } {
  const today = new Date()
  return {
    from: subDays(today, days),
    to: today,
  }
}

// Función para calcular la diferencia en días entre dos fechas
export function daysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === "string" ? parseISO(startDate) : startDate
  const end = typeof endDate === "string" ? parseISO(endDate) : endDate

  return differenceInDays(end, start)
}

// Función para formatear montos como pesos argentinos
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(amount)
}
