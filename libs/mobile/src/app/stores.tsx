import {
  Feature,
  isAnyMultisigWallet,
  MultisigWallet,
  TerraMultisigWallet,
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

export function useTerraMultisigWallet(): TerraMultisigWallet {
  const { currentWallet } = useStore().obiWalletsStore;
  invariant(currentWallet, "Expected current wallet to be terra multisig.");
  return currentWallet;
}

export function useLoopOrObiMultisigWallet() {
  const { configStore, obiWalletsStore, walletsStore } = useStore();

  if (configStore.isFeatureEnabled(Feature.ObiWalletsStore)) {
    const { currentWallet } = obiWalletsStore;
    invariant(currentWallet, "Expected current wallet to be terra multisig.");
    return currentWallet;
  } else {
    const { currentWallet } = walletsStore;
    invariant(
      isAnyMultisigWallet(currentWallet),
      "Expected current wallet to be multisig."
    );
    return currentWallet;
  }
}
