"use client";

import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { WalletDataFlow } from "@/wallet-data-flow";
import { ObservableMpcWallet } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export const Recovery = observer(function Recovery() {
  useCurrentWallet({ redirectTo: "/dashboard", redirectIfFound: true });
  const { chainStore, mpcWalletsStore, keyMetaDataStore } = useStore();

  const [key, setKey] = useState(0);
  const increaseKey = () => setKey((key) => key + 1);

  return (
    <WalletDataFlow
      key={key}
      homeChainId={chainStore.currentChain}
      initialValues={{}}
      onDone={({ wallet: walletData, keyMetaData }) => {
        const wallet = ObservableMpcWallet.create(walletData);

        keyMetaDataStore.setKeyMetaData(wallet.userEntryAddress, keyMetaData);
        mpcWalletsStore.upsertWallet(wallet);

        // TODO: potentially backup wallet somewhere? After updating owner!
      }}
      onBack={() => {
        increaseKey();
      }}
    />
  );
});
