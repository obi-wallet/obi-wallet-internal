import { Button, Text, Transaction } from "@/components";
import { useAlert } from "@/hooks/alert";
import { EffectStateDispatch } from "@/hooks/use-effect-state";
import { KeyMetaData } from "@/stores/key-meta-data";
import { AsyncButton } from "@/ui/button";
import { ApproveIntentions } from "@/user-interactions/approve-intentions";
import {
  handleMultisigKeyDecryptedMessages,
  IntentionsResults,
} from "@/user-interactions/approve-intentions/utils";
import { SendingAnimation } from "@/user-interactions/approve-messages/sending-animation";
import {
  WalletDataFlowState,
  WalletDataState,
} from "@/wallet-data-flow-new/state";
import { Base58EncodedString } from "@obi-wallet/encoding";
import { BackupShare, EasyShare } from "@obi-wallet/sdk";
import { Ed25519KeyPair } from "@obi-wallet/sdk-ed25519";
import { deserialize } from "@obi-wallet/sdk-json";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import invariant from "tiny-invariant";

export interface DecryptDataProps {
  state: WalletDataState;
  dispatch: EffectStateDispatch<typeof WalletDataFlowState>;
}

export const DecryptData = observer<DecryptDataProps>(function DecryptData({
  state,
  dispatch,
}) {
  const alert = useAlert();
  const owner = state.owner;
  const keyMetaData = state.keyMetaData;

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
        if (!state.walletData.ed25519KeyPair || !ed25519PrivateKeyRaw) {
          return null;
        }

        return {
          publicKey: {
            type: "tendermint/PubKeyEd25519",
            value: state.walletData.ed25519KeyPair.publicKey,
          },
          privateKey: Base58EncodedString.parse(ed25519PrivateKeyRaw),
        };
      }

      if (keyMetaDataRaw && firstShareRaw && secondShareRaw) {
        const easyShare = EasyShare.parse(deserialize(firstShareRaw));
        const backupShare = BackupShare.parse(deserialize(secondShareRaw));
        const keyMetaData = KeyMetaData.parse(deserialize(keyMetaDataRaw));

        await dispatch(
          state.setDecryptedData({
            easyShare,
            backupShare,
            ed25519KeyPair: getEd25519KeyPair(),
            keyMetaData,
          }),
        );
      } else {
        alert.showError("Wallet not recoverable");
      }
    },
    onError(error) {
      console.error(error);
    },
  });

  function getMultisigKeyEncryptedMessages() {
    const encryptedKeyMetaData = state.walletData.encryptedKeyMetaData;
    const encryptedEasyShare = state.walletData.encryptedShares.easy;
    const encryptedBackupShare = state.walletData.encryptedShares.backup;
    const encryptedEd25519PrivateKey =
      state.walletData.ed25519KeyPair?.encryptedPrivateKey;

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
              userEntryAddress: state.walletData.userEntryAddress,
              owner: state.walletData.owner,
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
            <AsyncButton
              block
              variant="outline"
              onClick={async () => {
                await dispatch(state.cancel());
              }}
            >
              Reject
            </AsyncButton>
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
