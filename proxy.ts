// Next.js 16: `proxy.ts` is the new name for `middleware.ts` (same functionality).
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// The (app) route group doesn't appear in URLs, so protect by path.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/items(.*)",
  "/settings(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
