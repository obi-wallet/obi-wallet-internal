import { Chain, Sdk } from "@obi-wallet/sdk";

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
      await Sdk.chainId(chainId).transactions.prepareKeyPair({
        publicKey: {
          type: "tendermint/PubKeySecp256k1",
          value: publicKey,
        },
        privateKey,
      });
      return true;
    },
    staleTime: staleTime({ days: 1 }),
  };
}
