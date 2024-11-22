import { trackBalances } from "@/analytics/worker-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userEntryAddress, balances } = await request.json();

  await trackBalances({ userEntryAddress, balances });

  return NextResponse.json({
    success: true,
  });
}
