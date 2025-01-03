import {
  deserializeUserOperation,
  SerializedEvmUserOperation,
} from "@/target-chain/eip-155";
import { Eip155ChainIdSchema } from "@/target-chain/eip-155/chains";
import { preparePimplicoClientAndKernelAccount } from "@/target-chain/eip-155/pimlico";
import { Secp256k1PublicKey } from "@obi-wallet/sdk";
import { z } from "zod";

export const maxDuration = 45;

const schema = z.object({
  targetChainId: Eip155ChainIdSchema,
  secp256k1PublicKey: Secp256k1PublicKey,
  userOperation: SerializedEvmUserOperation,
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json());
  if (!result.success) {
    console.error(result.error.errors);
    return new Response("Invalid request", {
      status: 400,
    });
  }

  const { targetChainId, secp256k1PublicKey, userOperation } = result.data;

  const { pimlicoClient, kernelAccount } =
    await preparePimplicoClientAndKernelAccount({
      targetChainId,
      secp256k1PublicKey,
    });

  const hash = await pimlicoClient.sendUserOperation({
    ...deserializeUserOperation(userOperation),
    account: kernelAccount,
  });

  return Response.json({
    hash,
  });
}
