import { NextResponse } from "next/server";

export async function POST() {
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    `zepetoAccessToken=; Expires=${new Date(0).toUTCString()}; Path=/`,
  );
  headers.append(
    "Set-Cookie",
    `zepetoRefreshToken=; Expires=${new Date(0).toUTCString()}; Path=/`,
  );

  return NextResponse.json(
    {
      success: true,
    },
    {
      headers,
    },
  );
}
