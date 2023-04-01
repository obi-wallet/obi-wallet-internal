import { MultisigWallet } from "@obi-wallet/sdk";
import invariant from "tiny-invariant";

import { staleTime } from "./helpers";

export function getIsOutdatedQuery(wallet: MultisigWallet | null | undefined) {
  return {
    queryKey: ["is-outdated", { proxyAddress: wallet?.proxyAddress }],
    queryFn: async () => {
      invariant(wallet, "wallet is required");
      return await wallet.isOutdated();
    },
    staleTime: staleTime({ minute: 1 }),
    enabled: !!wallet,
  };
}
