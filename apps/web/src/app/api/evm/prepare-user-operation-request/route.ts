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
import { Secp256k1PublicKey } from "@obi-wallet/sdk";
import { createSmartAccountClient } from "permissionless";
import { http } from "viem";
import { z } from "zod";

export const maxDuration = 45;

const schema = z.object({
  targetChainId: Eip155ChainIdSchema,
  secp256k1PublicKey: Secp256k1PublicKey,
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

  const { targetChainId, secp256k1PublicKey, calls } = result.data;

  const { pimlicoClient, kernelAccount } =
    await preparePimplicoClientAndKernelAccount({
      targetChainId,
      secp256k1PublicKey,
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
