import { type NextRequest } from "next/server";
import speakeasy from "speakeasy";
import { z } from "zod";

const schema = z.object({
  secret: z.string(),
  token: z.string(),
});

export async function POST(request: NextRequest): Promise<Response> {
  const result = schema.safeParse(await request.json());
  if (!result.success) {
    console.error(result.error.errors);
    return new Response("Invalid request", {
      status: 400,
    });
  }

  const { secret, token } = result.data;

  const verified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
  });

  return Response.json({
    verified,
  });
}
