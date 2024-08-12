import { Button, Text, Transaction } from "@/components";
import { useAlert } from "@/hooks/alert";
import { KeyMetaData } from "@/stores/key-meta-data";
import {
  ApproveIntentions,
  handleMultisigKeyDecryptedMessages,
  IntentionsResults,
} from "@/user-interactions/approve-intentions";
import { SendingAnimation } from "@/user-interactions/approve-messages/sending-animation";
import { useWalletDataFlowContext } from "@/wallet-data-flow/context";
import { useFinishFlow } from "@/wallet-data-flow/utils";
import { BackupShare, EasyShare, WalletData } from "@obi-wallet/sdk";
import { deserialize } from "@obi-wallet/sdk-json";
import { useMutation } from "@tanstack/react-query";
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
  const finishFlow = useFinishFlow();
  const alert = useAlert();
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
        const easyShare = EasyShare.parse(deserialize(firstShareRaw));
        const backupShare = BackupShare.parse(deserialize(secondShareRaw));
        const keyMetaData = KeyMetaData.parse(deserialize(keyMetaDataRaw));

        if (state.ownerDraft.value.primaryKey) {
          await finishFlow({
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
        alert.showError("Wallet not recoverable");
      }
    },
    onError(error) {
      console.error(error);
    },
  });

  function getMultisigKeyEncryptedMessages(): string[] {
    const encryptedKeyMetaData = walletData.encryptedKeyMetaData;
    const encryptedEasyShare = walletData.encryptedShares.easy;
    const encryptedBackupShare = walletData.encryptedShares.backup;

    return [
      ...(encryptedKeyMetaData ? [encryptedKeyMetaData] : []),
      ...(encryptedEasyShare ? [encryptedEasyShare] : []),
      encryptedBackupShare,
    ];
  }

  return (
    <div className="relative w-full md:mt-24">
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
              userEntryAddress: walletData.userEntryAddress,
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

          <div className="mt-6 flex w-full flex-row space-x-6">
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

      {approve.isPending && <SendingAnimation />}
    </div>
  );
});
