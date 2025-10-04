import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isAuthenticated = !!token;

  // Get the pathname from the URL
  const path = req.nextUrl.pathname;

  // Define protected routes that require authentication
  const protectedRoutes = [
    '/books/add',
    '/profile',
    '/messages',
  ];

  // Check if the path starts with any of the protected routes
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );

  // Redirect unauthenticated users to the login page if they try to access a protected route
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL('/auth/signin', req.url);
    url.searchParams.set('callbackUrl', encodeURI(path));
    return NextResponse.redirect(url);
  }

  // Allow authenticated users to access the protected routes
  return NextResponse.next();
}

// Specify which routes the middleware should run on
export const config = {
  matcher: [
    '/books/add/:path*',
    '/profile/:path*',
    '/messages/:path*',
  ],
}; 