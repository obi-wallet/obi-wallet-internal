import { Button, Text, Transaction } from "@/components";
import { IntentionsResult } from "@/keys/intentions-handler";
import { SharesLocalEncryption } from "@/lib/encryption";
import {
  ApproveIntentions,
  handleMultisigKeyDecryptedMessages,
} from "@/user-interactions/approve-intentions";
import {
  BackupShare,
  EasyShare,
  MpcWallet,
  MultisigKey,
  Serialized,
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

  onApprove(wallet: Serialized<MpcWallet>): void;
}

export const RecoverWallet = observer<RecoverWalletProps>(
  function RecoverWallet({ owner, walletData, onApprove, onReject }) {
    const [results, setResults] = useState<
      Map<string, IntentionsResult> | undefined
    >(undefined);

    const approve = useMutation({
      mutationFn: async () => {
        invariant(results, "Results not found");

        const [firstShare, secondShare] =
          await handleMultisigKeyDecryptedMessages({
            multisigKeyEncryptedMessages: getMultisigKeyEncryptedMessages(),
            multisigKey: owner,
            results,
          });

        if (firstShare && secondShare) {
          const easyShare = EasyShare.parse(JSON.parse(firstShare));
          const backupShare = BackupShare.parse(JSON.parse(secondShare));

          const localEncryption = new SharesLocalEncryption(owner);
          const encryptedShares = await localEncryption.encrypt({
            easy: easyShare,
            backup: backupShare,
          });

          const wallet = MpcWallet.create({
            homeChain: owner.chainId,
            owner: owner.toJSON()!,
            userEntryAddress: walletData.proxyAddress.address,
            encryptedShares,
          });
          onApprove(wallet.toJSON());
        }
      },
      onError(error) {
        console.error(error);
      },
    });

    function getMultisigKeyEncryptedMessages(): string[] {
      const encryptedEasyShare = walletData.encryptedEasyShare;
      const encryptedBackupShare = walletData.encryptedBackupShare;

      return [
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
