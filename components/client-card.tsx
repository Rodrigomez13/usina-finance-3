"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { ClientDetailsModal } from "./client-details-modal"

interface ClientCardProps {
  name: string
  id: number
  stats: {
    leads: number
    expenses: number
    funding: number
    balance: number
  }
  dateRange?: {
    from: Date
    to: Date
  }
}

export function ClientCard({ name, id, stats, dateRange }: ClientCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false)

  return (
    <>
      <Card className="bg-white border border-[#e8f3f1] shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="border-b border-[#e8f3f1] flex flex-row justify-between items-center">
          <CardTitle className="text-[#0e6251]">{name}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="border-[#a2d9ce] text-[#148f77] hover:bg-[#f0f9f7]"
            onClick={() => setDetailsOpen(true)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver Detalles
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-[#7f8c8d]">Leads:</span>
              <span className="font-medium">{stats.leads}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7f8c8d]">Gastos:</span>
              <span className="font-medium">${stats.expenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#7f8c8d]">Fondeos:</span>
              <span className="font-medium">${stats.funding.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#e8f3f1]">
              <span className="font-bold text-[#34495e]">Balance:</span>
              <span className={`font-bold ${stats.balance >= 0 ? "text-[#148f77]" : "text-[#e74c3c]"}`}>
                ${stats.balance.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ClientDetailsModal
        clientId={id}
        clientName={name}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        dateRange={dateRange}
      />
    </>
  )
}
