import { getFeeLender } from "@/lib/fee-lender";
import { ChainIdSchema } from "@obi-wallet/sdk";
import { z } from "zod";

const schema = z.object({
  chainId: ChainIdSchema,
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json());
  if (!result.success) {
    return new Response("Invalid request", {
      status: 400,
      statusText: "Bad Request",
    });
  }

  const { chainId } = result.data;
  const { wallet, signer, lenderIndex } = getFeeLender(chainId);

  console.log(wallet, signer, lenderIndex);

  return Response.json({});
}
