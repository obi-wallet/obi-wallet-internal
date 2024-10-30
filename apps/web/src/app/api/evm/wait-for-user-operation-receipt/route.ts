import { Eip155ChainIdSchema } from "@/target-chain/eip-155/chains";
import { preparePimlicoClient } from "@/target-chain/eip-155/pimlico";
import { HexEncodedStringWithPrefix } from "@obi-wallet/encoding";
import { z } from "zod";

export const maxDuration = 45;

const schema = z.object({
  targetChainId: Eip155ChainIdSchema,
  hash: HexEncodedStringWithPrefix,
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json());
  if (!result.success) {
    console.error(result.error.errors);
    return new Response("Invalid request", {
      status: 400,
    });
  }

  const { hash, targetChainId } = result.data;

  const pimlicoClient = preparePimlicoClient(targetChainId);

  const receipt = await pimlicoClient.waitForUserOperationReceipt({
    hash,
  });

  return Response.json({
    success: receipt.success,
    reason: receipt.reason,
    txHash: receipt.receipt.transactionHash,
  });
}
