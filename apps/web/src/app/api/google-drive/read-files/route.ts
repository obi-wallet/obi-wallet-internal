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
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent("mimeType='application/json'")}&fields=${encodeURIComponent("files(id,name)")}&spaces=appDataFolder`,
    {
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${accessToken}`,
      }),
    },
  );
  if (response.status !== 200) {
    console.log(await response.text());
    return NextResponse.json(
      {
        success: false,
      },
      {
        status: response.status,
      },
    );
  }

  const fileList = await response.json();
  return NextResponse.json(fileList);
}
