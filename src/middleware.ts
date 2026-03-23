import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Supabase Auth Middleware - Protects routes requiring authentication
 *
 * Routes matching these patterns will require a valid session:
 * - / (root - main app)
 *
 * Public routes:
 * - /signin
 * - /api/auth/* (NextAuth endpoints)
 * - Static assets
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files and NextAuth endpoints to pass through
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public/') ||
    pathname.startsWith('/api/auth/')
  ) {
    return NextResponse.next();
  }

  // Allow the signin page without auth check
  if (pathname === '/signin') {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If no user and accessing protected route, redirect to signin
    if (!user) {
      const redirectUrl = new URL('/signin', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    // If Supabase is not configured, allow access (demo mode)
    console.warn('Auth middleware warning:', error);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - public folder
     * - api/auth endpoints (NextAuth)
     * - signin page
     */
    '/((?!_next/static|_next/image|favicon|public|api/auth|signin).*)',
  ],
};
