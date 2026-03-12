import { withAuth } from 'next-auth/middleware';

/**
 * NextAuth Middleware - Protects routes requiring authentication
 * 
 * Routes matching these patterns will require a valid session:
 * - / (root - main app)
 * - /api (except auth endpoints)
 */

export default withAuth({
  pages: {
    signIn: '/signin',
  },
});

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
