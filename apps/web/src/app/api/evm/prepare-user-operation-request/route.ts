import { HomeChain } from "@/home-chain";
import { TargetChain } from "@/target-chain";
import { EvmChainIdSchema } from "@/target-chain/evm/chains";
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
  targetChainId: EvmChainIdSchema,
  userEntryAddress: z.string(),
  callData: HexEncodedStringWithPrefix,
});

// @ts-expect-error TODO: This is needed for JSON serialize, maybe we should do that differently
BigInt.prototype.toJSON = function () {
  return this.toString();
};

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
    await HomeChain.chainId(homeChainId).publicKey(userEntryAddress);
  const targetChain = TargetChain.chainId(targetChainId);

  const pimlicoUrl = `https://api.pimlico.io/v2/${targetChain.evmChainId}/rpc?apikey=${process.env.PIMLICO_API_KEY}`;

  const account = toAccount({
    address: TargetChain.chainId(targetChainId).computeAddress(publicKey),
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
    transport: http(pimlicoUrl),
    entryPoint: targetChain.entryPoint,
  });

  const bundlerClient = createPimlicoBundlerClient({
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

  const userOp = await smartAccountClient.prepareUserOperationRequest({
    userOperation: {
      callData,
    },
  });

  return Response.json({
    success: true,
    userOp,
  });
}
