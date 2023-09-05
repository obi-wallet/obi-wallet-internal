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
    name: "accessToken",
    value: accessToken,
    httpOnly: true,
    maxAge: 3600000,
    path: "/",
    ...(process.env.NODE_ENV === "production"
      ? {
          sameSite: "none",
          secure: true,
        }
      : {}),
  });
  cookies().set({
    name: "refreshToken",
    value: refreshToken,
    httpOnly: true,
    maxAge: 3600000,
    path: "/",
    ...(process.env.NODE_ENV === "production"
      ? {
          sameSite: "none",
          secure: true,
        }
      : {}),
  });

  return NextResponse.json({
    userId,
  });
}
