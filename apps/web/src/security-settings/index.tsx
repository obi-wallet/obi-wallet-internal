"use client";

import { useStore } from "@/contexts";
import { HomeChain } from "@/home-chain";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { WalletDataFlow } from "@/wallet-data-flow";
import { useQuery } from "@obi-wallet/headless-ui";
import { ObservableMpcWallet } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import invariant from "tiny-invariant";

export const SecuritySettings = observer(function SecuritySettings() {
  const wallet = useCurrentWallet({});
  const router = useRouter();
  const { keyMetaDataStore, mpcWalletsStore } = useStore();

  const walletData = useQuery({
    queryKey: ["wallet-data", wallet?.userEntryAddress],
    queryFn: async () => {
      invariant(wallet, "Expected wallet to be set.");
      invariant(
        wallet.owner.primaryKey,
        "Expected wallet to have a primary key",
      );
      const homeChain = HomeChain.chainId(wallet.homeChainId!);
      return await homeChain.lookupWalletBackup({
        homeChainId: wallet.homeChainId,
        publicKey: wallet.owner.primaryKey.publicKey,
      });
    },
  });

  if (!wallet || !walletData.data) return null;

  return (
    <WalletDataFlow
      homeChainId={wallet.homeChainId}
      initialValues={{
        owner: wallet.owner,
        walletData: walletData.data,
        keyMetaData: keyMetaDataStore.getKeyMetaData(wallet.userEntryAddress),
        locallyEncryptedSharesByPreviousOwner: {
          easy: wallet.encryptedEasyShare,
          backup: wallet.encryptedBackupShare,
        },
      }}
      onDone={({ wallet: walletData, keyMetaData }) => {
        const wallet = ObservableMpcWallet.create(walletData);

        keyMetaDataStore.setKeyMetaData(wallet.userEntryAddress, keyMetaData);
        mpcWalletsStore.upsertWallet(wallet);
        router.replace("/dashboard/settings");
      }}
      onBack={() => {
        router.replace("/dashboard/settings");
      }}
    />
  );
});
