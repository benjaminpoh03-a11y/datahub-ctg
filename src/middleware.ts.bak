import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Allow the request to proceed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect all routes except auth-related ones
        const { pathname } = req.nextUrl
        
        // Allow public routes
        const publicPaths = ['/login', '/register', '/api/auth']
        if (publicPaths.some(path => pathname.startsWith(path))) {
          return true
        }
        
        // Allow static files and _next
        if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
          return true
        }
        
        // Require authentication for all other routes
        return !!token
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|login|register).*)'],
}
