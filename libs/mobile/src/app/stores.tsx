import { RootStore } from "@obi-wallet/common";
import { isTerraChain, terraChains } from "@obi-wallet/sdk";
import { createContext, useContext } from "react";
import invariant from "tiny-invariant";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const StoreContext = createContext<RootStore>(null!);

export function useStore() {
  return useContext(StoreContext);
}

export function useCurrentTerraChainInformation() {
  const { chainStore } = useStore();
  const chainId = chainStore.currentChain;
  invariant(
    isTerraChain(chainId),
    "Expected current chain to be a terra chain."
  );
  return terraChains[chainId];
}
