import { TargetChain } from "@/target-chain";
import {
  CosmosSdkChainId,
  CosmosSdkChains,
} from "@/target-chain/cosmos-sdk/chains";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";

export function useAddresses({
  publicKey,
}: {
  publicKey: Secp256k1PublicKey | undefined;
}) {
  if (!publicKey) {
    return null;
  }
  console.log("CHAINS", CosmosSdkChains);
  const addresses = Object.keys(CosmosSdkChains).map((chainKey) => {
    const chain = CosmosSdkChains[chainKey as keyof typeof CosmosSdkChains];
    return {
      chain: chain.name,
      address: TargetChain.chainId(chainKey as CosmosSdkChainId).computeAddress(
        publicKey,
      ),
    };
  });

  return addresses;
}
