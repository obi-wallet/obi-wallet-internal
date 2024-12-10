import {
  defaultSession,
  sessionOptions,
  SessionData,
} from "@/analytics/session/lib";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const session = await getIronSession<SessionData>(
    // @ts-expect-error Changes of Next.js 15 haven't been reflected in the types yet
    await cookies(),
    sessionOptions,
  );
  const { password } = await request.json();
  session.isLoggedIn = password === process.env.ANALYTICS_SECRET;
  console.log("SESSION IS LOGGED IN", session.isLoggedIn);
  await session.save();
  return Response.json(session);
}

export async function GET() {
  const session = await getIronSession<SessionData>(
    // @ts-expect-error Changes of Next.js 15 haven't been reflected in the types yet
    await cookies(),
    sessionOptions,
  );

  if (session.isLoggedIn !== true) {
    return Response.json(defaultSession);
  }

  return Response.json(session);
}

export async function DELETE() {
  const session = await getIronSession<SessionData>(
    // @ts-expect-error Changes of Next.js 15 haven't been reflected in the types yet
    await cookies(),
    sessionOptions,
  );

  session.destroy();

  return Response.json(defaultSession);
}
