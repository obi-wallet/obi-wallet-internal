import { TargetChain } from "@/target-chain";
import {
  CosmosSdkChains,
  isCosmosSdkChainId,
} from "@/target-chain/cosmos-sdk/chains";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import invariant from "tiny-invariant";

export function useAddresses({
  publicKey,
}: {
  publicKey: Secp256k1PublicKey | undefined;
}) {
  if (!publicKey) {
    return null;
  }
  const addresses = Object.keys(CosmosSdkChains).map((chainKey) => {
    invariant(isCosmosSdkChainId(chainKey), `Invalid chain key: ${chainKey}`);
    const chain = CosmosSdkChains[chainKey];
    return {
      chain: chain.name,
      address: TargetChain.chainId(chainKey).computeAddress(publicKey),
    };
  });

  return addresses;
}
