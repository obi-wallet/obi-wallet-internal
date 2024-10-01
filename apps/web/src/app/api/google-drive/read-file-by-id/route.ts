import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  accessToken: z.string(),
  fileId: z.string(),
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json());
  if (!result.success) {
    console.error(result.error.errors);
    return new Response("Invalid request", {
      status: 400,
    });
  }

  const { accessToken, fileId } = result.data;

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${accessToken}`,
      }),
    },
  );

  const fileContent = await response.json();

  return NextResponse.json(fileContent);
}
