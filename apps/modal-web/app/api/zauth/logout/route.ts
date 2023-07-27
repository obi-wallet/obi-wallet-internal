import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  cookies().delete("zepetoAccessToken");
  cookies().delete("zepetoRefreshToken");

  return NextResponse.json({
    success: true,
  });
}
