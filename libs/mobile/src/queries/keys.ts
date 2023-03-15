import { Chain, Sdk, Secp256k1PrivateKeySigner } from "@obi-wallet/sdk";

import { staleTime } from "./helpers";

export function getPrepareKeyQuery({
  chainId,
  publicKey,
  privateKey,
}: {
  chainId: Chain;
  publicKey: string;
  privateKey: string;
}) {
  return {
    queryKey: ["prepare-key", { chainId, publicKey, privateKey }],
    queryFn: async () => {
      const signer = new Secp256k1PrivateKeySigner(privateKey);
      await Sdk.chainId(chainId).prepareSigner({ signer });
      return true;
    },
    staleTime: staleTime({ days: 1 }),
  };
}
