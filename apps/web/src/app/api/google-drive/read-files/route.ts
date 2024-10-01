import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  accessToken: z.string(),
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json());
  if (!result.success) {
    console.error(result.error.errors);
    return new Response("Invalid request", {
      status: 400,
    });
  }

  const { accessToken } = result.data;

  const response = await fetch(
    "https://www.googleapis.com/drive/v3/files?q=mimeType='application/json'&fields=files(id,name)",
    {
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${accessToken}`,
      }),
    },
  );

  const fileList = await response.json();

  return NextResponse.json(fileList);
}
