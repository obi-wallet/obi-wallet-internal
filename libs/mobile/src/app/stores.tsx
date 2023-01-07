import {
  Feature,
  isAnyMultisigWallet,
  MultisigWallet,
  RootStore,
} from "@obi-wallet/common";
import { createContext, useContext } from "react";
import invariant from "tiny-invariant";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const StoreContext = createContext<RootStore>(null!);

export function useStore() {
  return useContext(StoreContext);
}

export function useWalletsStore() {
  const { configStore, walletsStore, obiWalletsStore } = useStore();

  if (configStore.isFeatureEnabled(Feature.ObiWalletsStore)) {
    return obiWalletsStore;
  }

  return walletsStore;
}

export function useMultisigWallet(): MultisigWallet {
  const { currentWallet } = useStore().walletsStore;
  invariant(
    isAnyMultisigWallet(currentWallet),
    "Expected current wallet to be multisig."
  );
  return currentWallet;
}
