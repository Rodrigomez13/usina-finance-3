import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Esta función se ejecuta antes de cada solicitud
export async function middleware(req: NextRequest) {
  // Verificar si la ruta es la página de login o recursos estáticos
  const isLoginPage = req.nextUrl.pathname === "/login"
  const isStaticResource =
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/favicon.ico") ||
    req.nextUrl.pathname.includes(".")

  // No aplicar redirección a recursos estáticos
  if (isStaticResource) {
    return NextResponse.next()
  }

  // IMPORTANTE: Desactivamos temporalmente la redirección automática
  // para permitir que la autenticación del lado del cliente funcione

  // Simplemente permitimos todas las solicitudes sin redirección
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
