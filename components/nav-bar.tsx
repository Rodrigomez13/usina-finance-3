"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User, BarChart3, BarChart2, Upload } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function NavBar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <header className="border-b border-[#a2d9ce] bg-gradient-to-r from-[#0e6251] to-[#148f77] shadow-sm">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex items-center">
          <BarChart3 className="h-6 w-6 text-white mr-2" />
          <div className="font-bold text-xl text-white">Sistema Financiero</div>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <Link
            href="/dashboard/charts"
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              pathname === "/dashboard/charts" ? "bg-white text-[#0e6251] font-medium" : "text-white hover:bg-white/10",
            )}
          >
            <BarChart2 className="h-4 w-4" />
            <span>Gráficos</span>
          </Link>
          <Link
            href="/import"
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              pathname === "/import" ? "bg-white text-[#0e6251] font-medium" : "text-white hover:bg-white/10",
            )}
          >
            <Upload className="h-4 w-4" />
            <span>Importar</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full bg-white/20 hover:bg-white/30">
                <Avatar className="h-8 w-8 border border-[#a2d9ce]">
                  <AvatarFallback className="bg-[#148f77] text-white">
                    {user?.email?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border border-[#e8f3f1] shadow-md" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-[#2c3e50]">
                    {user?.email || "Usuario no autenticado"}
                  </p>
                  <p className="text-xs leading-none text-[#7f8c8d]">ID: {user?.id?.substring(0, 8) || "N/A"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#e8f3f1]" />
              <DropdownMenuItem className="text-[#34495e] hover:bg-[#f0f9f7] hover:text-[#0e6251] cursor-pointer">
                <User className="mr-2 h-4 w-4 text-[#45b39d]" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[#34495e] hover:bg-[#f0f9f7] hover:text-[#0e6251] cursor-pointer">
                <Settings className="mr-2 h-4 w-4 text-[#45b39d]" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#e8f3f1]" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-[#34495e] hover:bg-[#f0f9f7] hover:text-[#0e6251] cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4 text-[#45b39d]" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
