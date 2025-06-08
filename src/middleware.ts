// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

// Define protected and public routes
const protectedRoutes = ['/evaluation', '/dashboard'];
const authPages = ['/login', '/register'];

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
    // Include /api/inngest explicitly in the matcher if you want the middleware to run for it
    // but then handle it in the middleware itself.
    // However, for API routes that should be entirely public, it's often simpler to exclude them from the matcher.
    // Let's adjust the matcher to be more explicit about what it *should* match.
    // If you want middleware to process ALL routes and then explicitly exclude, keep it.
    // But for a true public API, it's often better to not match it at all.
    // Given your current `matcher`, `/api/inngest` would indeed be matched by `/:path*` implicitly IF it was there.

    // Better way: Exclude /api/inngest from the matcher directly for simplicity.
    // This makes it truly "public" in terms of middleware processing.
    '/((?!api/inngest|api/ai-chat|_next/static|_next/image|favicon.ico).*)', // Matches everything EXCEPT these patterns

  ],
};

// // import { clerkMiddleware } from '@clerk/nextjs/server';

// // export default clerkMiddleware();

// // export const config = {
// //   matcher: [
// //     // Skip Next.js internals and all static files, unless found in search params
// //     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
// //     // Always run for API routes
// //     '/(api|trpc)(.*)',
// //   ],
// // };

// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// const isPublicRoute = createRouteMatcher([
//     '/login(.*)',
//     '/signup(.*)',
//     '/',
//     '/api/inngest'
    
// ])

// export default clerkMiddleware(async (auth, req) => {
//     if (!isPublicRoute(req)) {
//         await auth.protect()
//     }
// })

// export const config = {
//     matcher: [
//         // Skip Next.js internals and all static files, unless found in search params
//         '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//         // Always run for API routes
//         '/(api|trpc)(.*)',
//     ],
// }