import { toAssets } from "@/dashboard/assets";
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  if (
    Object.keys(toAssets).some((asset) => {
      return pathname === `/${asset}`;
    })
  ) {
    return NextResponse.redirect(
      new URL(`/onboarding/fast-travel/${url.pathname}`, url.origin),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};
