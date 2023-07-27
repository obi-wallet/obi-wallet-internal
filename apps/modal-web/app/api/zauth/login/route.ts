import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { fetchUserId } from "../../../../src/zauth";

export async function POST(request: Request) {
  const {
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  } = await request.json();

  const userId = await fetchUserId(accessToken);

  if (!userId) {
    return NextResponse.json(
      {
        error: "invalid token",
      },
      { status: 401 },
    );
  }

  cookies().set({
    name: "zepetoAccessToken",
    value: accessToken,
    httpOnly: true,
    maxAge: 3600000,
    path: "/",
  });
  cookies().set({
    name: "zepetoRefreshToken",
    value: refreshToken,
    httpOnly: true,
    maxAge: 3600000,
    path: "/",
  });

  return NextResponse.json({
    userId,
  });
}
