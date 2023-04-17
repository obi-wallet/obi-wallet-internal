import { MultisigWallet } from "@obi-wallet/sdk";
import { createContext, useContext } from "react";
import invariant from "tiny-invariant";

import { RootStore } from "../store";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const RootStoreContext = createContext<RootStore>(null!);

export const RootStoreProvider = RootStoreContext.Provider;

export function useRootStore() {
  return useContext(RootStoreContext);
}

export function useCurrentWallet(): MultisigWallet {
  const { walletsStore } = useRootStore();
  invariant(walletsStore.currentWallet, "Expected current wallet to be set.");
  return walletsStore.currentWallet;
}
