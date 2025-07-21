import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Check if the user is trying to access admin routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      // If user is not authenticated, redirect to login
      if (!req.nextauth.token) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
      
      // Optional: Add role-based checks here if you have user roles
      // if (req.nextauth.token.role !== 'admin') {
      //   return NextResponse.redirect(new URL('/auth/error?error=AccessDenied', req.url));
      // }
    }
    
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Require authentication for protected routes
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*', // Protect all admin routes
    // Add other protected routes here if needed
  ],
}; 