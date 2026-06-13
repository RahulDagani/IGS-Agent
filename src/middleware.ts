import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const agentStatus = request.cookies.get("agent_status")?.value;

  const isAuthenticated = !!token;

  // Public paths — always allow (exact or prefix match only for true public pages)
  const isPublicSignin = pathname.startsWith("/signin");
  const isPublicReset = pathname.startsWith("/reset");
  // Only the signup registration page itself is public, NOT sub-paths like onboarding/*
  const isPublicSignup = pathname === "/signup/agent" || pathname === "/signup/agent/";

  if (isPublicSignin || isPublicReset || isPublicSignup) {
    // If already authenticated and verified, redirect away from signin
    if (isAuthenticated && !agentStatus && isPublicSignin) {
      return NextResponse.redirect(new URL("/partner", request.url));
    }
    return NextResponse.next();
  }

  // Not authenticated → send to login
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/signin/agent", request.url));
  }

  // Onboarding pages — only for business_pending status
  if (pathname.startsWith("/signup/agent/onboarding")) {
    if (agentStatus === "under_review") {
      return NextResponse.redirect(new URL("/signup/agent/pending-verification", request.url));
    }
    if (agentStatus === "verification_failed") {
      return NextResponse.redirect(new URL("/signup/agent/verification-failed", request.url));
    }
    if (agentStatus === "verified" || !agentStatus) {
      return NextResponse.redirect(new URL("/partner", request.url));
    }
    return NextResponse.next();
  }

  // Pending verification — only for under_review
  if (pathname.startsWith("/signup/agent/pending-verification")) {
    if (agentStatus === "business_pending") {
      return NextResponse.redirect(new URL("/signup/agent/onboarding/business", request.url));
    }
    if (agentStatus === "verification_failed") {
      return NextResponse.redirect(new URL("/signup/agent/verification-failed", request.url));
    }
    if (agentStatus === "verified" || !agentStatus) {
      return NextResponse.redirect(new URL("/partner", request.url));
    }
    return NextResponse.next();
  }

  // Verification failed page — only for verification_failed
  if (pathname.startsWith("/signup/agent/verification-failed")) {
    if (agentStatus === "business_pending") {
      return NextResponse.redirect(new URL("/signup/agent/onboarding/business", request.url));
    }
    if (agentStatus === "under_review") {
      return NextResponse.redirect(new URL("/signup/agent/pending-verification", request.url));
    }
    if (agentStatus === "verified" || !agentStatus) {
      return NextResponse.redirect(new URL("/partner", request.url));
    }
    return NextResponse.next();
  }

  // Partner dashboard — must be verified (no pending status)
  if (pathname.startsWith("/partner")) {
    if (agentStatus === "business_pending") {
      return NextResponse.redirect(new URL("/signup/agent/onboarding/business", request.url));
    }
    if (agentStatus === "under_review") {
      return NextResponse.redirect(new URL("/signup/agent/pending-verification", request.url));
    }
    if (agentStatus === "verification_failed") {
      return NextResponse.redirect(new URL("/signup/agent/verification-failed", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/partner/:path*",
    "/signup/agent/:path*",
    "/signin/:path*",
    "/reset/:path*",
  ],
};
