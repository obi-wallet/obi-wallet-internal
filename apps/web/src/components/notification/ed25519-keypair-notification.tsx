"use client";

import { Notification } from "@/components";
import { useStore } from "@/contexts";
import { HomeChain } from "@/home-chain";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { MultisigKeyEncryption } from "@/lib/encryption";
import { useWalletBackupMutation } from "@/wallet-health/checks";
import { useQuery } from "@obi-wallet/headless-ui";
import { generateEd25519KeyPair } from "@obi-wallet/sdk-ed25519";
import { skipToken } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import invariant from "tiny-invariant";

export const Ed25519KeyPairNotification = observer(
  function Ed25519KeyPairNotification() {
    const currentWallet = useCurrentWallet();
    const backupWallet = useWalletBackupMutation();
    const { mpcWalletsStore } = useStore();

    const walletDataContainsEd25519KeyPair = useQuery({
      queryKey: [
        "wallet-data-ed25519-key-pair",
        currentWallet?.userEntryAddress,
      ],
      queryFn: currentWallet
        ? async () => {
            invariant(currentWallet.owner.primaryKey);
            const walletData = await HomeChain.chainId(
              currentWallet.homeChainId,
            ).lookupWalletBackup({
              homeChainId: currentWallet.homeChainId,
              publicKey: currentWallet.owner.primaryKey.publicKey,
            });

            return walletData
              ? !!walletData.ed25519KeyPair
              : !!currentWallet.ed25519PublicKey;
          }
        : skipToken,
    });

    if (
      walletDataContainsEd25519KeyPair.isLoading ||
      walletDataContainsEd25519KeyPair.data === true
    ) {
      return null;
    }

    return (
      <Notification
        description="Your account needs a quick upgrade to work with Solana. Click here to upgrade now."
        type="warning"
        onClick={async () => {
          invariant(currentWallet, "Expected current wallet to be defined");
          const multisigKeyEncryption = new MultisigKeyEncryption(
            currentWallet.owner.publicKey,
          );

          if (!currentWallet?.ed25519PublicKey) {
            const keyPair = generateEd25519KeyPair();
            currentWallet.setEd25519KeyPair({
              publicKey: keyPair.publicKey.value,
              encryptedPrivateKey: await multisigKeyEncryption.encrypt(
                keyPair.privateKey,
              ),
            });
          }

          mpcWalletsStore.upsertWallet(currentWallet);
          await backupWallet.mutateAsync();
        }}
      />
    );
  },
);
