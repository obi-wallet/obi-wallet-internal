import { TargetChain } from "@/target-chain";
import {
  deserializeUserOperationCalls,
  SerializedEvmUserOperationCalls,
  serializeUserOperation,
} from "@/target-chain/eip-155";
import { Eip155ChainIdSchema } from "@/target-chain/eip-155/chains";
import {
  getPimlicoUrl,
  preparePimplicoClientAndKernelAccount,
} from "@/target-chain/eip-155/pimlico";
import { HomeChainIdSchema } from "@obi-wallet/sdk";
import { createSmartAccountClient } from "permissionless";
import { http } from "viem";
import { z } from "zod";

export const maxDuration = 45;

const schema = z.object({
  homeChainId: HomeChainIdSchema,
  targetChainId: Eip155ChainIdSchema,
  userEntryAddress: z.string(),
  calls: SerializedEvmUserOperationCalls,
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json());
  if (!result.success) {
    console.error(result.error.errors);
    return new Response("Invalid request", {
      status: 400,
    });
  }

  const { homeChainId, targetChainId, userEntryAddress, calls } = result.data;

  const { pimlicoClient, kernelAccount } =
    await preparePimplicoClientAndKernelAccount({
      homeChainId,
      targetChainId,
      userEntryAddress,
    });
  const targetChain = TargetChain.chainId(targetChainId);

  const smartAccountClient = createSmartAccountClient({
    account: kernelAccount,
    chain: targetChain.chainData.chain,
    paymaster: pimlicoClient,
    bundlerTransport: http(getPimlicoUrl(targetChainId)),
    userOperation: {
      estimateFeesPerGas: async () => {
        return (await pimlicoClient.getUserOperationGasPrice()).fast;
      },
    },
  });

  const userOperation = await smartAccountClient.prepareUserOperation({
    account: kernelAccount,
    calls: deserializeUserOperationCalls(calls),
  });

  return Response.json({
    success: true,
    userOperation: serializeUserOperation(userOperation),
  });
}
