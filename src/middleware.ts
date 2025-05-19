// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

// Define protected and public routes
const protectedRoutes = ['/evaluation', '/dashboard']; // add more as needed
const authPages = ['/login', '/register'];

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const url = req.nextUrl.clone();

  // 🚫 If trying to access protected route without token, redirect to login
  if (protectedRoutes.some((route) => url.pathname.startsWith(route)) && !token) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 🚫 If logged in and trying to access login/register page, redirect to evaluation
  if (token && authPages.includes(url.pathname)) {
    url.pathname = '/evaluation';
    return NextResponse.redirect(url);
  }

  // ✅ Allow request
  return NextResponse.next();
}

// Match all routes
export const config = {
  matcher: ['/', '/login', '/register', '/evaluation', '/dashboard/:path*'],
};
