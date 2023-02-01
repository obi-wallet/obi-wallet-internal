import {
  cosmosChains,
  isCosmosChain,
  isTerraChain,
  MultisigWallet,
  RootStore,
  terraChains,
} from "@obi-wallet/common";
import { createContext, useContext } from "react";
import invariant from "tiny-invariant";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const StoreContext = createContext<RootStore>(null!);

export function useStore() {
  return useContext(StoreContext);
}

export function useMultisigWallet(): MultisigWallet {
  const { walletsStore } = useStore();
  const { currentWallet } = walletsStore;
  invariant(currentWallet, "Expected current wallet to be multisig.");
  return currentWallet;
}

export function useCurrentCosmosChainInformation() {
  const { chainStore } = useStore();
  const chainId = chainStore.currentChain;
  invariant(
    isCosmosChain(chainId),
    "Expected current chain to be a cosmos chain."
  );
  return cosmosChains[chainId];
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
