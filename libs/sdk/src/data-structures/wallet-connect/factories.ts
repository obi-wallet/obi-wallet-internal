import { action, computed, makeObservable, observable } from "mobx";

import { WalletConnect } from "./implementation";
import { Wallets } from "../wallets";

export function createWalletConnect(wallets: Wallets) {
  return new WalletConnect(wallets);
}

export function createObservableWalletConnect(wallets: Wallets) {
  const walletConnect = createWalletConnect(wallets);
  makeObservable<
    WalletConnect,
    "_connectors" | "saveConnector" | "removeConnector"
  >(
    walletConnect,
    {
      _connectors: observable,
      connectors: computed,
      toJSON: false,
      saveConnector: action,
      removeConnector: action,
    },
    {
      name: "WalletConnect",
    }
  );
  return walletConnect;
}
