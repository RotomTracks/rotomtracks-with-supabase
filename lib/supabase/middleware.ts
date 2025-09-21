import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasRequiredEnvVars, getSupabaseConfig, getClientOptions } from "./config";
import { 
  requiresAuthentication, 
  requiresOrganizerRole, 
  requiresPlayerRole,
  requiresAdminRole,
  isPublicRoute 
} from "../auth/roles";
import { UserRole } from "../types/tournament";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip middleware check. You can remove this
  // once you setup the project.
  if (!hasRequiredEnvVars()) {
    console.warn('Supabase environment variables not configured, skipping auth middleware');
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const config = getSupabaseConfig();
  const options = getClientOptions();
  
  const supabase = createServerClient(
    config.url,
    config.anonKey,
    {
      ...options,
      global: {
        ...options.global,
        headers: {
          ...options.global.headers,
          'X-Client-Info': 'rotomtracks-middleware',
        },
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  let user = null;
  try {
    const { data, error } = await supabase.auth.getClaims();
    if (error) {
      console.error('Auth error in middleware:', error);
      // Continue without user for now
    } else {
      user = data?.claims;
    }
  } catch (error) {
    console.error('Failed to get auth claims in middleware:', error);
    // Continue without user for now
  }
  const pathname = request.nextUrl.pathname;

  // Check if route is public (doesn't require authentication)
  if (isPublicRoute(pathname)) {
    return supabaseResponse;
  }

  // Check if user is authenticated for protected routes
  if (requiresAuthentication(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // If user is authenticated, check role-based permissions
  if (user) {
    let userProfile = null;
    
    // Get user profile for role checking
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_role')
        .eq('user_id', user.sub)
        .single();
      
      userProfile = profile;
    } catch (error) {
      console.error('Error fetching user profile in middleware:', error);
    }

    // Check admin-only routes (highest priority)
    if (requiresAdminRole(pathname)) {
      if (!userProfile || userProfile.user_role !== UserRole.ADMIN) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/unauthorized";
        url.searchParams.set("reason", "admin_required");
        url.searchParams.set("redirectTo", pathname);
        return NextResponse.redirect(url);
      }
    }

    // Check organizer-only routes
    if (requiresOrganizerRole(pathname)) {
      if (!userProfile || userProfile.user_role !== UserRole.ORGANIZER) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/unauthorized";
        url.searchParams.set("reason", "organizer_required");
        url.searchParams.set("redirectTo", pathname);
        return NextResponse.redirect(url);
      }
    }

    // Check player-only routes (if any)
    if (requiresPlayerRole(pathname)) {
      if (!userProfile || userProfile.user_role !== UserRole.PLAYER) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/unauthorized";
        url.searchParams.set("reason", "player_required");
        url.searchParams.set("redirectTo", pathname);
        return NextResponse.redirect(url);
      }
    }

    // If user doesn't have a profile yet, redirect to profile completion
    // (except for auth routes and profile creation)
    if (!userProfile && 
        !pathname.startsWith('/auth') && 
        !pathname.startsWith('/profile') &&
        pathname !== '/') {
      const url = request.nextUrl.clone();
      url.pathname = "/profile/complete";
      url.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Legacy authentication check for backward compatibility
  if (
    pathname !== "/" &&
    !user &&
    !pathname.startsWith("/login") &&
    !pathname.startsWith("/auth")
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
