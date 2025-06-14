// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

// Define protected and public routes
const protectedRoutes = ['/evaluation', '/dashboard'];
const authPages = ['/login', '/signup'];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // 1) If this is the AI-chat API route OR Inngest API route, skip all auth logic
  if (url.pathname === '/api/ai-chat' || url.pathname === '/api/inngest' || url.pathname === '/api/logout') {
    return NextResponse.next();
  }

  // 2) Now handle page-level auth/redirect
  const token = req.cookies.get('token')?.value;

  // Redirect to /login if hitting a protected page without a token
  if (
    protectedRoutes.some((route) => url.pathname.startsWith(route)) &&
    !token
  ) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If already logged in and trying to access login/register, send to /evaluation
  if (token && authPages.includes(url.pathname)) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/evaluation',
    '/dashboard/:path*',
    '/((?!api/inngest|api/ai-chat|_next/static|_next/image|favicon.ico).*)', // Matches everything EXCEPT these patterns

  ],
};
