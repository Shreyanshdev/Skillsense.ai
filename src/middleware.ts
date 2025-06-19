import { NextRequest, NextResponse } from 'next/server';

// Define routes that require authentication via middleware (e.g., /evaluation)
// '/dashboard' should still implicitly be handled here if it's protected by the presence of a token,
// or if you want to explicitly check it at the middleware level too.
// For now, based on your comment, let's assume it might have public elements or
// its auth is handled in the page component more, but the middleware should still
// check for login status to redirect away from /login if token is present.
const PROTECTED_ROUTES = ['/evaluation', '/dashboard']; // Added /dashboard here for middleware protection

// Define routes that are typically for authentication purposes (login, signup)
// and should redirect if a user is already logged in.
const AUTH_PAGES = ['/login', '/signup'];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  console.log(`[Middleware] Incoming request for: ${url.pathname}`);

  // --- Step 1: Exclude specific API routes and static assets from all auth logic ---
  // These paths should bypass middleware authentication checks entirely.
  // CRITICAL: Ensure /api/auth/* are excluded as they manage tokens or user state.
  const EXCLUDED_PREFIXES = [
    '/api/ai-chat',
    '/api/inngest',
    // All /api/auth routes are essential for authentication flow and should be excluded
    '/api/auth/', // Matches /api/auth/login, /api/auth/register, /api/auth/refresh-token, /api/auth/google, etc.
    '/api/logout', // This is also often part of auth flow, so keeping it explicitly excluded
    '/_next/static/',     // Next.js static files (JS, CSS, images)
    '/_next/image/',      // Next.js image optimization
    '/favicon.ico',       // Favicon
    '/login', // Exclude /login route itself from redirection loop if it fails auth check
    '/signup', // Exclude /signup route itself from redirection loop if it fails auth check
  ];

  // Check if the current request path starts with any of the excluded prefixes
  if (EXCLUDED_PREFIXES.some(prefix => url.pathname.startsWith(prefix))) {
    console.log(`[Middleware] Bypassing auth for excluded path: ${url.pathname}`);
    return NextResponse.next();
  }

  // --- Step 2: Retrieve the authentication token from cookies ---
  const token = req.cookies.get('token')?.value;
  console.log(`[Middleware] Authentication token present: ${!!token}`); // Logs true if token exists, false otherwise

  // --- Step 3: Handle redirects for protected pages ---
  // If a user tries to access a route defined in PROTECTED_ROUTES without a valid token,
  // they are redirected to the login page.
  const isProtectedPath = PROTECTED_ROUTES.some(route => url.pathname === route || url.pathname.startsWith(`${route}/`));

  if (isProtectedPath && !token) {
    console.log(`[Middleware] Access to protected route (${url.pathname}) denied without token. Redirecting to /login.`);
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // --- Step 4: Handle redirects for authentication pages ---
  // If a user *is* logged in (has a token) and tries to access login/signup pages,
  // they are redirected to the dashboard.
  const isAuthPage = AUTH_PAGES.includes(url.pathname);

  if (token && isAuthPage) {
    console.log(`[Middleware] Logged-in user attempting to access auth page (${url.pathname}). Redirecting to /dashboard.`);
    url.pathname = '/dashboard'; // Redirect to the dashboard if authenticated
    return NextResponse.redirect(url);
  }

  // --- Step 5: Allow the request to proceed ---
  // If none of the above conditions trigger a redirect, let the request continue.
  console.log(`[Middleware] Allowing request to proceed for: ${url.pathname}`);
  return NextResponse.next();
}

// Configuration for which paths the middleware should apply to
export const config = {
  // Matcher for paths to apply middleware to.
  // It's designed to cover all routes that need auth checks, while
  // letting Next.js internal files and static assets bypass.
  matcher: [
    // This regex means: match any path that is NOT...
    // - starting with /api (handled by the explicit EXCLUDED_PREFIXES for /api/auth, etc.)
    // - starting with /_next/static/
    // - starting with /_next/image/
    // - exactly /favicon.ico
    // So, it will cover all your / (root), /login, /signup, /dashboard, /evaluation, etc.
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};