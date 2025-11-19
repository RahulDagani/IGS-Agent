// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AuthService } from '@/lib/auth';

// Define role-based route access
const routePermissions = {
  '/admin': ['admin'],
  '/partner': ['agent', 'admin'],
  '/student': ['student', 'agent', 'admin'],
  '/university': ['university', 'admin'],
};

// Public routes that don't require authentication
const publicRoutes = [
  '/signin',
  '/register',
  '/signin/agent',
  '/register/agent',
  '/api/auth/login',
  '/api/auth/register/agent',
  '/forgot-password',
];

export async function middleware(request: NextRequest) {
  // const { pathname } = request.nextUrl;

  // // Check if route is public
  // if (publicRoutes.some(route => pathname.startsWith(route))) {
  //   return NextResponse.next();
  // }

  // // Get session token
  // const token = request.cookies.get('auth-token')?.value;

  // if (!token) {
  //   return redirectToLogin(request, pathname);
  // }

  // // Verify session
  // const session = await AuthService.verifyToken(token);

  // if (!session) {
  //   return redirectToLogin(request, pathname);
  // }

  // // Check role-based access
  // if (!hasRouteAccess(pathname, session.role, session.type)) {
  //   return redirectToUnauthorized(request);
  // }

  // // Add user to request headers for API routes
  // if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/')) {
  //   const requestHeaders = new Headers(request.headers);
  //   requestHeaders.set('x-user-id', session.userId.toString());
  //   requestHeaders.set('x-tenant-id', session.tenantId.toString());
  //   requestHeaders.set('x-user-role', session.role);
  //   requestHeaders.set('x-user-type', session.type);
    
  //   if (session.agentId) {
  //     requestHeaders.set('x-agent-id', session.agentId.toString());
  //   }

  //   return NextResponse.next({
  //     request: {
  //       headers: requestHeaders,
  //     },
  //   });
  // }

  return NextResponse.next();
}

function hasRouteAccess(pathname: string, userRole: string, userType: string): boolean {
  // Admin has access to everything
  if (userType === 'admin') {
    return true;
  }

  for (const [route, allowedRoles] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      return allowedRoles.includes(userRole);
    }
  }

  return true; // Allow access to non-protected routes
}

function redirectToLogin(request: NextRequest, currentPath: string) {
  // Determine which login page to redirect to based on the attempted path
  let loginPath = '/signin';
  if (currentPath.startsWith('/partner')) {
    loginPath = '/signin/agent';
  }

  const loginUrl = new URL(loginPath, request.url);
  loginUrl.searchParams.set('callbackUrl', currentPath);
  return NextResponse.redirect(loginUrl);
}

function redirectToUnauthorized(request: NextRequest) {
  return NextResponse.redirect(new URL('/unauthorized', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};