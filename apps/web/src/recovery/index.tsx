"use client";

import { useStore } from "@/contexts";
import { WalletDataFlow } from "@/wallet-data-flow";
import { InitialState } from "@/wallet-data-flow/state";
import { ObservableMpcWallet } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";

export const Recovery = observer(function Recovery() {
  const { chainStore, mpcWalletsStore, keyMetaDataStore } = useStore();
  const router = useRouter();

  return (
    <WalletDataFlow
      initialState={
        new InitialState({
          chainId: chainStore.currentChain,
        })
      }
      onDone={({ wallet: walletData, keyMetaData }) => {
        const wallet = ObservableMpcWallet.create(walletData);

        keyMetaDataStore.setKeyMetaData(wallet.id, keyMetaData);
        mpcWalletsStore.upsertWallet(wallet);
        router.push("/dashboard");
      }}
    />
  );
});
