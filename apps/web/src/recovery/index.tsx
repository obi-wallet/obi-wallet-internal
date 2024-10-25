"use client";

import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { WalletDataFlow } from "@/wallet-data-flow";
import { InitialState } from "@/wallet-data-flow/state";
import { ObservableMpcWallet } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";

export const Recovery = observer(function Recovery() {
  useCurrentWallet({ redirectTo: "/dashboard", redirectIfFound: true });
  const { chainStore, mpcWalletsStore, keyMetaDataStore } = useStore();

  return (
    <WalletDataFlow
      initialState={
        new InitialState({
          chainId: chainStore.currentChain,
        })
      }
      onDone={({ wallet: walletData, keyMetaData }) => {
        const wallet = ObservableMpcWallet.create(walletData);

        keyMetaDataStore.setKeyMetaData(wallet.userEntryAddress, keyMetaData);
        mpcWalletsStore.upsertWallet(wallet);
      }}
    />
  );
});
