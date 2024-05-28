import { TargetChain } from "@/target-chain";
import { EvmChainIdSchema } from "@/target-chain/evm/chains";
import { HexEncodedStringWithPrefix } from "@obi-wallet/encoding";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import { http } from "viem";
import { z } from "zod";

export const maxDuration = 45;

const schema = z.object({
  targetChainId: EvmChainIdSchema,
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
  const targetChain = TargetChain.chainId(targetChainId);

  const pimlicoUrl = `https://api.pimlico.io/v2/${targetChain.evmChainId}/rpc?apikey=${process.env.PIMLICO_API_KEY}`;
  const bundlerClient = createPimlicoBundlerClient({
    chain: targetChain.chainData.chain,
    transport: http(pimlicoUrl),
    entryPoint: targetChain.entryPoint,
  });

  const receipt = await bundlerClient.waitForUserOperationReceipt({
    hash,
  });

  return Response.json({
    success: receipt.success,
    reason: receipt.reason,
    txHash: receipt.receipt.transactionHash,
  });
}
