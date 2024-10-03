"use client";

import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import {
  SyncWalletData,
  useWalletDataStateQuery,
  WalletDataStateType,
} from "@/wallet-data-backup/sync-wallet-data";
import { WalletDataFlow } from "@/wallet-data-flow";
import { useWalletBackupMutation } from "@/wallet-health/checks";
import { ObservableMpcWallet } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useEffectOnceWhen } from "rooks";

export const SecuritySettings = observer(function SecuritySettings() {
  const wallet = useCurrentWallet({});
  const router = useRouter();
  const { keyMetaDataStore, mpcWalletsStore } = useStore();
  const backupWallet = useWalletBackupMutation();

  const walletDataState = useWalletDataStateQuery();

  useEffectOnceWhen(() => {
    if (walletDataState.data?.type === WalletDataStateType.NotAvailable) {
      backupWallet.mutate();
    }
  }, !!wallet && !!walletDataState.data);

  if (!wallet || !walletDataState.data) return null;

  switch (walletDataState.data.type) {
    case WalletDataStateType.Outdated:
      return <SyncWalletData />;
    case WalletDataStateType.UpToDate:
      return (
        <WalletDataFlow
          homeChainId={wallet.homeChainId}
          initialValues={{
            owner: wallet.owner,
            walletData: walletDataState.data.payload,
            keyMetaData: keyMetaDataStore.getKeyMetaData(
              wallet.userEntryAddress,
            ),
            locallyEncryptedSharesByPreviousOwner: {
              easy: wallet.encryptedEasyShare,
              backup: wallet.encryptedBackupShare,
            },
            ed25519KeyPairPreviousOwner:
              wallet.ed25519PublicKey && wallet.encryptedEd25519PrivateKey
                ? {
                    publicKey: wallet.ed25519PublicKey,
                    encryptedPrivateKey: wallet.encryptedEd25519PrivateKey,
                  }
                : undefined,
          }}
          onDone={({ wallet: walletData, keyMetaData }) => {
            const wallet = ObservableMpcWallet.create(walletData);

            keyMetaDataStore.setKeyMetaData(
              wallet.userEntryAddress,
              keyMetaData,
            );
            mpcWalletsStore.upsertWallet(wallet);
            router.replace("/dashboard/settings");
          }}
          onBack={() => {
            router.replace("/dashboard/settings");
          }}
        />
      );
  }
});
