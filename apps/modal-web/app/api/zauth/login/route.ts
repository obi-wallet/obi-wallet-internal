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

  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    `zepetoAccessToken=${accessToken}; HttpOnly; Max-Age=3600000; Path=/`,
  );
  headers.append(
    "Set-Cookie",
    `zepetoRefreshToken=${refreshToken}; HttpOnly; Max-Age=3600000; Path=/`,
  );

  return NextResponse.json(
    {
      userId,
    },
    {
      headers,
    },
  );
}
