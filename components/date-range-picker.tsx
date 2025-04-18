"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Definir las props incluyendo el callback para el cambio de fecha y el valor inicial
interface CalendarDateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  onDateChange?: (dateRange: DateRange | undefined) => void
  initialDateRange?: DateRange
}

export function CalendarDateRangePicker({ className, onDateChange, initialDateRange }: CalendarDateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(
    initialDateRange || {
      from: new Date(2025, 3, 1),
      to: new Date(),
    },
  )

  // Manejar cambios y notificar al padre
  const handleDateSelect = (dateRange: DateRange | undefined) => {
    setDate(dateRange)
    if (onDateChange && dateRange?.from && dateRange?.to) {
      onDateChange(dateRange)
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[260px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y", { locale: es })} - {format(date.to, "LLL dd, y", { locale: es })}
                </>
              ) : (
                format(date.from, "LLL dd, y", { locale: es })
              )
            ) : (
              <span>Seleccione un rango de fechas</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect} // Usar el manejador personalizado
            numberOfMonths={2}
            locale={es}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
