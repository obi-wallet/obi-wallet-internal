import { Button, Text, Transaction } from "@/components";
import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { IntentionsPayload } from "@/keys/intentions-handler";
import { AsyncButton } from "@/ui/button";
import { ApproveIntentions } from "@/user-interactions/approve-intentions";
import {
  handleEncryptedBackupShare,
  handleEncryptedEasyShare,
  handleEncryptedNetworkShare,
  IntentionsResults,
} from "@/user-interactions/approve-intentions/utils";
import { SendingAnimation } from "@/user-interactions/approve-messages/sending-animation";
import {
  useWalletDataStateQuery,
  WalletDataStateType,
} from "@/wallet-data-backup/sync-wallet-data";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import invariant from "tiny-invariant";

export const SetupHomeAccount = observer(function SetupHomeAccount() {
  const walletDataState = useWalletDataStateQuery();

  if (
    walletDataState.data?.type !== WalletDataStateType.HomeAccountNotAvailable
  ) {
    return null;
  }

  return <SetupHomeAccountInner />;
});

const SetupHomeAccountInner = observer(function SetupHomeAccountInner() {
  const { homeAccountSetupStore, keyMetaDataStore } = useStore();
  const wallet = useCurrentWallet();

  const [results, setResults] = useState<IntentionsResults | undefined>(
    undefined,
  );

  const approve = useMutation({
    mutationFn: async () => {
      invariant(wallet, "Wallet not found");
      invariant(wallet.encryptedNetworkShare, "Network share not found");
      invariant(results, "Results not found");

      const multisigKey = wallet.owner;

      const [easy, backup, network] = await Promise.all([
        handleEncryptedEasyShare({
          encryptedEasyShare: wallet.encryptedEasyShare,
          results,
          multisigKey,
        }),
        handleEncryptedBackupShare({
          encryptedBackupShare: wallet.encryptedBackupShare,
          results,
          multisigKey,
        }),
        handleEncryptedNetworkShare({
          encryptedNetworkShare: wallet.encryptedNetworkShare,
          results,
          multisigKey,
        }),
      ]);

      await homeAccountSetupStore.setupHomeAccount({
        wallet,
        shares: {
          // TODO: should be dynamic
          keygenParam: { parties: 3, threshold: 1 },
          backupParticipants: [2, 3],
          networkParticipants: [1, 3],
          easyShare: easy,
          backupShare: backup,
          networkShare: network,
        },
      });
    },
    onError(error) {
      console.error(error);
    },
  });

  const owner = wallet?.owner;
  const keyMetaData = keyMetaDataStore.getKeyMetaData(wallet?.id ?? "");

  const intentionsPayload: IntentionsPayload = {
    signHashes: [],
    decryptShares: {
      easy: wallet?.encryptedEasyShare ?? null,
      backup: wallet?.encryptedBackupShare ?? null,
      network: wallet?.encryptedNetworkShare ?? null,
    },
    decryptMessages: [],
    decryptPrimaryKeyEncryptedMessages: [],
    decryptMultisigKeyEncryptedMessages: [],
  };

  if (!owner) {
    return null;
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
            memo=""
            descriptions={["Setup Home Account"]}
            // TODO
            rawData={{}}
          />

          <ApproveIntentions
            multisigKey={owner}
            keyMetaData={keyMetaData}
            intentions={intentionsPayload}
            onApprove={(results) => {
              setResults(results);
            }}
          />

          <div className="mt-6 flex w-full flex-row space-x-6">
            <AsyncButton
              block
              variant="outline"
              onClick={async () => {
                // await dispatch(state.cancel());
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
