// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

// Define protected and public routes
const protectedRoutes = ['/evaluation', '/dashboard'];
const authPages = ['/login', '/register'];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // 1) If this is the AI‐chat API route, skip all auth logic
  if (url.pathname === '/api/ai-chat') {
    return NextResponse.next();
  }

  // 2) Now handle page‐level auth/redirect
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
    url.pathname = '/evaluation';
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
    // Note: /api/ai-chat is intentionally not included here, since we handle it explicitly above
  ],
};

// import { clerkMiddleware } from '@clerk/nextjs/server';

// export default clerkMiddleware();

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     // Always run for API routes
//     '/(api|trpc)(.*)',
//   ],
// };