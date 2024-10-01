import { serialize } from "@obi-wallet/sdk-json";
import { Secp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  accessToken: z.string(),
  metadata: z.object({
    name: z.string(),
    mimeType: z.string(),
  }),
  fileContent: Secp256k1KeyPair,
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json());
  if (!result.success) {
    console.error(result.error.errors);
    return new Response("Invalid request", {
      status: 400,
    });
  }

  const { accessToken, metadata, fileContent } = result.data;

  const file = new Blob([serialize(fileContent)], { type: metadata.mimeType });
  const form = new FormData();
  form.append(
    "metadata",
    new Blob([serialize(metadata)], { type: "application/json" }),
  );
  form.append("file", file);

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: new Headers({
        Authorization: `Bearer ${accessToken}`,
      }),
      body: form,
    },
  );
  if (response.status !== 200) {
    return NextResponse.json(
      {
        success: false,
      },
      {
        status: response.status,
      },
    );
  }

  return NextResponse.json({
    success: true,
  });
}
