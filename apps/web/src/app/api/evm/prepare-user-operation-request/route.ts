import { HomeChain } from "@/home-chain";
import { TargetChain } from "@/target-chain";
import { serializeUserOperation } from "@/target-chain/eip-155";
import { Eip155ChainIdSchema } from "@/target-chain/eip-155/chains";
import { HexEncodedStringWithPrefix } from "@obi-wallet/encoding";
import { HomeChainIdSchema } from "@obi-wallet/sdk";
import { createSmartAccountClient } from "permissionless";
import {
  createPimlicoBundlerClient,
  createPimlicoPaymasterClient,
} from "permissionless/clients/pimlico";
import { http } from "viem";
import { toAccount } from "viem/accounts";
import { z } from "zod";

export const maxDuration = 45;

const schema = z.object({
  homeChainId: HomeChainIdSchema,
  targetChainId: Eip155ChainIdSchema,
  userEntryAddress: z.string(),
  callData: HexEncodedStringWithPrefix,
});

export async function POST(request: Request) {
  const result = schema.safeParse(await request.json());
  if (!result.success) {
    console.error(result.error.errors);
    return new Response("Invalid request", {
      status: 400,
    });
  }

  const { homeChainId, targetChainId, userEntryAddress, callData } =
    result.data;
  const publicKey =
    await HomeChain.chainId(homeChainId).secp256k1PublicKey(userEntryAddress);
  const targetChain = TargetChain.chainId(targetChainId);

  const pimlicoUrl = `https://api.pimlico.io/v2/${targetChain.eip155ChainId}/rpc?apikey=${process.env.PIMLICO_API_KEY}`;

  const account = toAccount({
    address: targetChain.computeAddress(publicKey),
    async signMessage() {
      throw new Error("signMessage not implemented");
    },
    async signTransaction() {
      throw new Error("signTransaction not implemented");
    },
    async signTypedData() {
      throw new Error("signTypedData not implemented");
    },
  });

  const kernelAccount = await targetChain.kernelAccount(account);

  const paymasterClient = createPimlicoPaymasterClient({
    chain: targetChain.chainData.chain,
    transport: http(pimlicoUrl),
    entryPoint: targetChain.entryPoint,
  });

  const bundlerClient = createPimlicoBundlerClient({
    chain: targetChain.chainData.chain,
    transport: http(pimlicoUrl),
    entryPoint: targetChain.entryPoint,
  });

  const smartAccountClient = createSmartAccountClient({
    account: kernelAccount,
    entryPoint: targetChain.entryPoint,
    chain: targetChain.chainData.chain,
    bundlerTransport: http(),
    middleware: {
      sponsorUserOperation: paymasterClient.sponsorUserOperation,
      gasPrice: async () => {
        return (await bundlerClient.getUserOperationGasPrice()).fast;
      },
    },
  });

  const userOperation = await smartAccountClient.prepareUserOperationRequest({
    userOperation: {
      callData,
    },
  });

  return Response.json({
    success: true,
    userOperation: serializeUserOperation(userOperation),
  });
}
