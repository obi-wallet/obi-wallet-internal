import { sessionOptions, SessionData } from "@/analytics/session/lib";
import { fetchReport } from "@/analytics/worker-client";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const session = await getIronSession<SessionData>(
    // @ts-expect-error Changes of Next.js 15 haven't been reflected in the types yet
    await cookies(),
    sessionOptions,
  );
  if (!session.isLoggedIn) {
    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 401,
      },
    );
  }

  const [{ path }, from, to] = await Promise.all([
    params,
    request.nextUrl.searchParams.get("from"),
    request.nextUrl.searchParams.get("to"),
  ]);

  return NextResponse.json(
    await fetchReport({
      path,
      from,
      to,
    }),
  );
}
