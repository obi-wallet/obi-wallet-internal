import { Button, Text, Transaction } from "@/components";
import { useAlert } from "@/hooks/alert";
import { KeyMetaData } from "@/stores/key-meta-data";
import { ApproveIntentions } from "@/user-interactions/approve-intentions";
import {
  handleMultisigKeyDecryptedMessages,
  IntentionsResults,
} from "@/user-interactions/approve-intentions/utils";
import { SendingAnimation } from "@/user-interactions/approve-messages/sending-animation";
import { useWalletDataFlowContext } from "@/wallet-data-flow/context";
import { useFinishFlow } from "@/wallet-data-flow/utils";
import { Base58EncodedString } from "@obi-wallet/encoding";
import { BackupShare, EasyShare, WalletData } from "@obi-wallet/sdk";
import { Ed25519KeyPair } from "@obi-wallet/sdk-ed25519";
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

      const [
        keyMetaDataRaw,
        firstShareRaw,
        secondShareRaw,
        ed25519PrivateKeyRaw,
      ] = await handleMultisigKeyDecryptedMessages({
        multisigKeyEncryptedMessages: getMultisigKeyEncryptedMessages(),
        multisigKey: owner,
        results,
      });

      function getEd25519KeyPair(): Ed25519KeyPair | null {
        if (!walletData.ed25519KeyPair || !ed25519PrivateKeyRaw) {
          return null;
        }

        return {
          publicKey: {
            type: "tendermint/PubKeyEd25519",
            value: walletData.ed25519KeyPair.publicKey,
          },
          privateKey: Base58EncodedString.parse(ed25519PrivateKeyRaw),
        };
      }

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
            ed25519KeyPair: getEd25519KeyPair(),
            keyMetaData,
          });
          return;
        }

        dispatch({
          type: "approve-decrypt-wallet-data",
          payload: {
            easyShare,
            backupShare,
            ed25519KeyPair: getEd25519KeyPair(),
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

  function getMultisigKeyEncryptedMessages() {
    const encryptedKeyMetaData = walletData.encryptedKeyMetaData;
    const encryptedEasyShare = walletData.encryptedShares.easy;
    const encryptedBackupShare = walletData.encryptedShares.backup;
    const encryptedEd25519PrivateKey =
      walletData.ed25519KeyPair?.encryptedPrivateKey;

    return [
      ...(encryptedKeyMetaData ? [encryptedKeyMetaData] : []),
      ...(encryptedEasyShare ? [encryptedEasyShare] : []),
      encryptedBackupShare,
      ...(encryptedEd25519PrivateKey ? [encryptedEd25519PrivateKey] : []),
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
              decryptEasyShare: null,
              decryptMessages: [],
              decryptPrimaryKeyEncryptedMessages: [],
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
