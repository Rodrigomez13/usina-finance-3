"use client"

import type React from "react"

// Componente simplificado que solo pasa los children
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
