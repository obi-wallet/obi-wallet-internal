import { fetchReport } from "@/analytics/worker-client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
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
