"use client";

import { Text } from "@/components";
import { useStore } from "@/contexts";
import { HomeChain } from "@/home-chain";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { WalletDataFlow } from "@/wallet-data-flow";
import { walletDataToMultisigKey } from "@/wallet-data-flow/state";
import { useQuery } from "@obi-wallet/headless-ui";
import {
  MultisigKey,
  ObservableMpcWallet,
  ObservableMultisigKey,
  Serialized,
  WalletData,
} from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import invariant from "tiny-invariant";

export enum WalletDataStateType {
  NotAvailable = "NotAvailable",
  UpToDate = "UpToDate",
  Outdated = "Outdated",
}

export type WalletDataState =
  | {
      type: WalletDataStateType.NotAvailable;
    }
  | {
      type: WalletDataStateType.UpToDate;
      payload: WalletData;
    }
  | {
      type: WalletDataStateType.Outdated;
      payload: {
        walletData: WalletData;
        owner: Serialized<MultisigKey>;
      };
    };

export function useWalletDataStateQuery() {
  const wallet = useCurrentWallet({});
  return useQuery({
    queryKey: [
      "wallet-data",
      wallet?.userEntryAddress,
      wallet?.previousWalletData,
    ],
    queryFn: async (): Promise<WalletDataState> => {
      invariant(wallet, "Expected wallet to be set.");
      const primaryKey = wallet.owner.primaryKey;
      invariant(primaryKey, "Expected wallet to have a primary key");
      const homeChain = HomeChain.chainId(wallet.homeChainId);
      const walletData = await homeChain.lookupWalletBackup({
        homeChainId: wallet.homeChainId,
        publicKey: wallet.owner.primaryKey.publicKey,
      });

      if (!walletData) {
        return {
          type: WalletDataStateType.NotAvailable,
        };
      }

      const backupRevision = walletData.revision;
      const previousRevision = wallet.previousWalletData?.revision ?? 0;

      if (previousRevision >= backupRevision) {
        return {
          type: WalletDataStateType.UpToDate,
          payload: walletData,
        };
      }

      const owner = walletDataToMultisigKey({
        homeChainId: wallet.homeChainId,
        wallet: walletData,
      });

      const containsPrimaryKey = owner.keys.find((key) => {
        return key.publicKey.value === primaryKey.publicKey.value;
      });

      if (!containsPrimaryKey) {
        return {
          type: WalletDataStateType.NotAvailable,
        };
      }

      owner.removeKeyByPublicKey(primaryKey.publicKey);
      const passkey = owner.addPasskeyKey(primaryKey.payload);
      owner.setPrimaryKey(passkey);

      return {
        type: WalletDataStateType.Outdated,
        payload: {
          walletData,
          owner: owner.toJSON()!,
        },
      };
    },
    enabled: !!wallet,
  });
}

export const SyncWalletData = observer(function SyncWalletData() {
  const { chainStore, mpcWalletsStore, keyMetaDataStore } = useStore();
  const router = useRouter();

  const [key, setKey] = useState(0);
  const increaseKey = () => {
    return setKey((key) => {
      return key + 1;
    });
  };

  const walletDataState = useWalletDataStateQuery();

  if (!walletDataState.data) return null;

  switch (walletDataState.data.type) {
    case WalletDataStateType.NotAvailable:
      return (
        <Text size="xl">
          This device does not have a wallet.{" "}
          <Link href="/recovery">Go to recovery</Link>
        </Text>
      );
    case WalletDataStateType.UpToDate:
      return (
        <Text size="xl">
          Local data is up-to-date.{" "}
          <Link href="/dashboard">Go to Dashboard</Link>
        </Text>
      );
    case WalletDataStateType.Outdated: {
      return (
        <WalletDataFlow
          key={key}
          homeChainId={chainStore.currentChain}
          initialValues={{
            walletData: walletDataState.data.payload.walletData,
            owner: ObservableMultisigKey.create(
              walletDataState.data.payload.walletData.homeChainId,
              walletDataState.data.payload.owner,
            ),
          }}
          onDone={({ wallet: walletData, keyMetaData }) => {
            const wallet = ObservableMpcWallet.create(walletData);

            keyMetaDataStore.setKeyMetaData(
              wallet.userEntryAddress,
              keyMetaData,
            );
            mpcWalletsStore.upsertWallet(wallet);
            router.push("/dashboard/settings");
          }}
          onBack={() => {
            increaseKey();
          }}
        />
      );
    }
  }
});
