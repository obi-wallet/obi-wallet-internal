import { Button, Text, Transaction } from "@/components";
import { WalletData } from "@/home-chain/secret-js";
import { KeyMetaData } from "@/stores/key-meta-data";
import {
  ApproveIntentions,
  handleMultisigKeyDecryptedMessages,
  IntentionsResults,
} from "@/user-interactions/approve-intentions";
import SendingAnimation from "@/user-interactions/approve-messages/sending-animation.json";
import { useWalletDataFlowContext } from "@/wallet-data-flow/context";
import { useFinishFlow } from "@/wallet-data-flow/utils";
import { BackupShare, EasyShare } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import Lottie from "lottie-react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import invariant from "tiny-invariant";

export interface DecryptDataProps {
  walletData: WalletData;
}

export const DecryptData = observer<DecryptDataProps>(function DecryptData({
  walletData,
}) {
  const { state, dispatch } = useWalletDataFlowContext();
  const commitData = useFinishFlow();
  const owner = state.ownerDraft.value;
  const keyMetaData = state.keyMetaDataDraft.value.value;

  const [results, setResults] = useState<IntentionsResults | undefined>(
    undefined,
  );

  const approve = useMutation({
    mutationFn: async () => {
      invariant(results, "Results not found");

      const [keyMetaDataRaw, firstShareRaw, secondShareRaw] =
        await handleMultisigKeyDecryptedMessages({
          multisigKeyEncryptedMessages: getMultisigKeyEncryptedMessages(),
          multisigKey: owner,
          results,
        });

      if (keyMetaDataRaw && firstShareRaw && secondShareRaw) {
        const easyShare = EasyShare.parse(JSON.parse(firstShareRaw));
        const backupShare = BackupShare.parse(JSON.parse(secondShareRaw));
        const keyMetaData = KeyMetaData.parse(JSON.parse(keyMetaDataRaw));

        if (state.ownerDraft.value.primaryKey) {
          await commitData({
            shares: {
              easy: easyShare,
              backup: backupShare,
            },
            keyMetaData,
          });
          return;
        }

        dispatch({
          type: "approve-decrypt-wallet-data",
          payload: {
            easyShare,
            backupShare,
            keyMetaData,
          },
        });
      } else {
        window.alert("Wallet not recoverable");
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
            memo=""
            rawData={{
              userEntryAddress: walletData.proxyAddress.address,
              owner: walletData.owner,
            }}
          />

          <ApproveIntentions
            multisigKey={owner}
            keyMetaData={keyMetaData}
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
            <Button
              block
              variant="outline"
              onClick={() => {
                dispatch({
                  type: "reject-decrypt-wallet-data",
                });
              }}
            >
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
});
