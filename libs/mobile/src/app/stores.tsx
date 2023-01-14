import {
  CosmosMultisigWallet,
  isAnyCosmosMultisigWallet,
  isAnyMultisigWallet,
  RootStore,
  TerraMultisigWallet,
} from "@obi-wallet/common";
import { createContext, useContext } from "react";
import invariant from "tiny-invariant";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const StoreContext = createContext<RootStore>(null!);

export function useStore() {
  return useContext(StoreContext);
}

export function useMultisigWallet():
  | TerraMultisigWallet
  | CosmosMultisigWallet {
  const { currentWallet } = useStore().walletsStore;
  invariant(
    isAnyMultisigWallet(currentWallet),
    "Expected current wallet to be multisig."
  );
  return currentWallet;
}

export function useCosmosMultisigWallet(): CosmosMultisigWallet {
  const { currentWallet } = useStore().walletsStore;
  invariant(
    isAnyCosmosMultisigWallet(currentWallet),
    "Expected current wallet to be cosmos multisig."
  );
  return currentWallet;
}
