import { CURRENT_WALLET_COOKIE_NAME } from "@/lib/current-wallet";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function isPublicRoute(path: string) {
  return isLandingPage(path) || isOnboarding(path) || isRecovery(path);

  function isLandingPage(path: string) {
    return path === "/";
  }

  function isOnboarding(path: string) {
    return path.startsWith("/onboarding");
  }

  function isRecovery(path: string) {
    return path === "/recovery";
  }
}

function isProtectedRoute(path: string) {
  return isDashboard(path);

  function isDashboard(path: string) {
    if (path === "/dashboard/app-connect") {
      return false;
    }

    return path.startsWith("/dashboard");
  }
}

export default async function middleware(req: NextRequest) {
  const currentWallet = (await cookies()).get(
    CURRENT_WALLET_COOKIE_NAME,
  )?.value;
  const path = req.nextUrl.pathname;

  if (isProtectedRoute(path) && !currentWallet) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (isPublicRoute(path) && currentWallet) {
    if (!path.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|monitoring|_next/static|_next/image|.*\\.png$).*)"],
};
