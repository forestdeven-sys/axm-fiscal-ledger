import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Supabase Auth Middleware - Protects routes requiring authentication
 * 
 * Refreshes the Supabase auth session on every request and redirects
 * unauthenticated users to /signin.
 */

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Protect all routes except static files, auth, signin, and public assets
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public folder
     * - auth endpoints (/api/auth/*)
     * - signin page
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth|signin).*)',
  ],
};
