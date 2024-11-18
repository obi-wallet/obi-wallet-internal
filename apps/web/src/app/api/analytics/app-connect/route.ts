import { trackAppConnect } from "@/analytics/worker-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userEntryAddress, dAppUrl } = await request.json();

  await trackAppConnect({ userEntryAddress, dAppUrl });

  return NextResponse.json({
    success: true,
  });
}
