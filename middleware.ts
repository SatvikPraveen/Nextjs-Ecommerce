// middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// Protected admin routes
const adminRoutes = ['/admin'];

// Routes that require authentication
const protectedRoutes = ['/profile', '/orders'];

// Public routes that redirect authenticated users
const authRoutes = ['/auth/signin', '/auth/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the token from the request
  const token = await getToken({ 
    req: request, 
    secret,
    cookieName: process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token'
  });

  // Check if the current route is an admin route
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the current route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Handle admin routes
  if (isAdminRoute) {
    if (!token) {
      // Redirect to sign-in page with callback URL
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Check if user has admin role
    if (token.role !== 'admin') {
      // Redirect to access denied page or home
      return NextResponse.redirect(new URL('/access-denied', request.url));
    }
  }

  // Handle protected routes (require authentication)
  if (isProtectedRoute && !token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Handle auth routes (redirect if already authenticated)
  if (isAuthRoute && token) {
    // Check if there's a callback URL
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
    if (callbackUrl && callbackUrl !== '/auth/signin') {
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
    // Otherwise redirect to profile or home
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  // Handle API routes
  if (pathname.startsWith('/api/admin')) {
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (token.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // Handle protected API routes
  const protectedApiRoutes = ['/api/profile', '/api/orders'];
  const isProtectedApiRoute = protectedApiRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedApiRoute && !token) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Add security headers
  const response = NextResponse.next();

  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://maps.googleapis.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' blob: data: https:;
    media-src 'self' blob: data:;
    connect-src 'self' https://api.stripe.com https://maps.googleapis.com;
    frame-src 'self' https://js.stripe.com https://hooks.stripe.com;
    worker-src 'self' blob:;
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);

  // Other security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // HTTPS redirect in production
  if (process.env.NODE_ENV === 'production' && 
      request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(
      `https://${request.headers.get('host')}${request.nextUrl.pathname}`,
      301
    );
  }

  // Rate limiting for sensitive routes
  const sensitiveRoutes = ['/auth/signin', '/auth/signup', '/api/auth'];
  const isSensitiveRoute = sensitiveRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isSensitiveRoute) {
    // Add rate limiting headers (implementation would depend on your rate limiting solution)
    response.headers.set('X-RateLimit-Limit', '5');
    response.headers.set('X-RateLimit-Remaining', '4');
    response.headers.set('X-RateLimit-Reset', (Date.now() + 900000).toString());
  }

  // Add user info to request headers for API routes
  if (pathname.startsWith('/api/') && token) {
    response.headers.set('X-User-ID', token.sub || '');
    response.headers.set('X-User-Role', token.role || 'user');
    response.headers.set('X-User-Email', token.email || '');
  }

  // Logging middleware (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] ${request.method} ${pathname} - User: ${token?.email || 'anonymous'} - Role: ${token?.role || 'none'}`);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|icons|robots.txt|sitemap.xml).*)',
  ],
};