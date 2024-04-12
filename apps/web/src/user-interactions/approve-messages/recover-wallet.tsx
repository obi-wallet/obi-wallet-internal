import { Button, Text, Transaction } from "@/components";
import { useStore } from "@/contexts";
import { IntentionsResult } from "@/keys/intentions-handler";
import { SharesLocalEncryption } from "@/lib/encryption";
import { KeyMetaData } from "@/stores/key-meta-data";
import {
  ApproveIntentions,
  handleMultisigKeyDecryptedMessages,
} from "@/user-interactions/approve-intentions";
import {
  BackupShare,
  EasyShare,
  MultisigKey,
  ObservableMpcWallet,
  WalletData,
} from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import Lottie from "lottie-react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import invariant from "tiny-invariant";

import SendingAnimation from "./sending-animation.json";

export interface RecoverWalletProps {
  owner: MultisigKey;
  walletData: WalletData;

  onReject(): void;
  onApprove(): void;
}

export const RecoverWallet = observer<RecoverWalletProps>(
  function RecoverWallet({ owner, walletData, onApprove, onReject }) {
    const { keyMetaDataStore, mpcWalletsStore, userDataStore } = useStore();
    const [results, setResults] = useState<
      Map<string, IntentionsResult> | undefined
    >(undefined);

    const approve = useMutation({
      mutationFn: async () => {
        invariant(results, "Results not found");

        const [keyMetaData, firstShare, secondShare] =
          await handleMultisigKeyDecryptedMessages({
            multisigKeyEncryptedMessages: getMultisigKeyEncryptedMessages(),
            multisigKey: owner,
            results,
          });

        // TODO: handle optionals
        if (keyMetaData && firstShare && secondShare) {
          const easyShare = EasyShare.parse(JSON.parse(firstShare));
          const backupShare = BackupShare.parse(JSON.parse(secondShare));

          const localEncryption = new SharesLocalEncryption(owner);
          const encryptedShares = await localEncryption.encrypt({
            easy: easyShare,
            backup: backupShare,
          });

          const wallet = ObservableMpcWallet.create({
            homeChain: owner.chainId,
            owner: owner.toJSON()!,
            userEntryAddress: walletData.proxyAddress.address,
            encryptedShares,
          });
          keyMetaDataStore.setKeyMetaData(
            wallet.userEntryAddress,
            KeyMetaData.parse(JSON.parse(keyMetaData)),
          );
          userDataStore.setUserData(
            wallet.userEntryAddress,
            walletData.userData,
          );
          mpcWalletsStore.upsertWallet(wallet);
          onApprove();
        }
      },
      onError(error) {
        console.error(error);
      },
    });

    function getMultisigKeyEncryptedMessages(): string[] {
      const encryptedKeyMetaData = walletData.encryptedKeyMetaData;
      const encryptedEasyShare = walletData.encryptedEasyShare;
      const encryptedBackupShare = walletData.encryptedBackupShare;

      return [
        ...(encryptedKeyMetaData ? [encryptedKeyMetaData] : []),
        ...(encryptedEasyShare ? [encryptedEasyShare] : []),
        encryptedBackupShare,
      ];
    }

    return (
      <div className="relative w-full">
        <div className="flex justify-center">
          <div className="flex w-fit flex-col items-center">
            <Text
              leading="loose"
              size="3xl"
              fontWeight="bold"
              className="mb-8 mt-4"
            >
              Complete Transaction
            </Text>

            <Transaction
              amountInfo={[]}
              feeInfo={[]}
              descriptions={["Recover Wallet"]}
              rawData={{
                userEntryAddress: walletData.proxyAddress.address,
                owner: walletData.owner,
                userData: {
                  name: walletData.userData.name,
                },
              }}
            />

            <ApproveIntentions
              multisigKey={owner}
              intentions={{
                signHashes: [],
                decryptMessages: [],
                decryptMultisigKeyEncryptedMessages:
                  getMultisigKeyEncryptedMessages(),
              }}
              onApprove={(results) => {
                setResults(results);
              }}
            />

            <div className="mt-6 flex w-full flex-row space-x-6 ">
              <Button block variant="outline" onClick={onReject}>
                Reject
              </Button>
              <Button
                block
                disabled={!results || approve.isPending}
                onClick={() => {
                  approve.mutate();
                }}
              >
                Approve
              </Button>
            </div>
          </div>
        </div>

        {approve.isPending && (
          <div className="absolute top-0 flex h-full w-full flex-1 flex-col items-center justify-center bg-black bg-opacity-50">
            <div className="w-60 rounded-xl bg-blue-600 p-5">
              <Lottie animationData={SendingAnimation} />
              <Text size="xl" className="justify-center text-white">
                Sending
              </Text>
            </div>
          </div>
        )}
      </div>
    );
  },
);
