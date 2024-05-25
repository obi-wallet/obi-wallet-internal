import { TargetChain } from "@/target-chain";
import {
  deserializeUserOperation,
  SerializedEvmUserOperation,
} from "@/target-chain/evm";
import { EvmChainIdSchema } from "@/target-chain/evm/chains";
import { createPimlicoBundlerClient } from "permissionless/clients/pimlico";
import { http } from "viem";
import { z } from "zod";

export const maxDuration = 45;

const schema = z.object({
  targetChainId: EvmChainIdSchema,
  // TODO: be more specific
  userOperation: z.custom<SerializedEvmUserOperation>(() => {
    return true;
  }),
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json());
  if (!result.success) {
    console.error(result.error.errors);
    return new Response("Invalid request", {
      status: 400,
    });
  }

  const { targetChainId, userOperation } = result.data;
  const targetChain = TargetChain.chainId(targetChainId);

  const pimlicoUrl = `https://api.pimlico.io/v2/${targetChain.evmChainId}/rpc?apikey=${process.env.PIMLICO_API_KEY}`;
  const bundlerClient = createPimlicoBundlerClient({
    chain: targetChain.chainData.chain,
    transport: http(pimlicoUrl),
    entryPoint: targetChain.entryPoint,
  });

  const hash = await bundlerClient.sendUserOperation({
    userOperation: deserializeUserOperation(userOperation),
  });

  return Response.json({
    hash,
  });
}
