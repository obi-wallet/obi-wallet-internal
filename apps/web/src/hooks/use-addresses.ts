import { allTargetChainIds, TargetChain } from "@/target-chain";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";

export function useAddresses({
  publicKey,
}: {
  publicKey: Secp256k1PublicKey | undefined;
}) {
  if (!publicKey) {
    return [];
  }

  return allTargetChainIds.map((targetChainId) => {
    const chain = TargetChain.chainId(targetChainId);
    return {
      chain: chain.label,
      address: chain.computeAddress(publicKey),
    };
  });
}
