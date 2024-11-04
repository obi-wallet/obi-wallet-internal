import "server-only";

import { HomeChain } from "@/home-chain";
import { TargetChain } from "@/target-chain";
import { Eip155ChainId } from "@/target-chain/eip-155/chains";
import { HomeChainId } from "@obi-wallet/sdk";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { http } from "viem";
import { toAccount } from "viem/accounts";

export function getPimlicoUrl(targetChainId: Eip155ChainId) {
  const targetChain = TargetChain.chainId(targetChainId);

  return `https://api.pimlico.io/v2/${targetChain.eip155ChainId}/rpc?apikey=${process.env.PIMLICO_API_KEY}`;
}

export function preparePimlicoClient(targetChainId: Eip155ChainId) {
  const targetChain = TargetChain.chainId(targetChainId);

  return createPimlicoClient({
    chain: targetChain.chainData.chain,
    transport: http(getPimlicoUrl(targetChainId)),
    entryPoint: targetChain.entryPoint,
  });
}

export async function preparePimplicoClientAndKernelAccount({
  homeChainId,
  targetChainId,
  userEntryAddress,
}: {
  homeChainId: HomeChainId;
  targetChainId: Eip155ChainId;
  userEntryAddress: string;
}) {
  const publicKey =
    await HomeChain.chainId(homeChainId).secp256k1PublicKey(userEntryAddress);
  const targetChain = TargetChain.chainId(targetChainId);

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

  const pimlicoClient = preparePimlicoClient(targetChainId);

  return {
    kernelAccount,
    pimlicoClient,
  };
}
