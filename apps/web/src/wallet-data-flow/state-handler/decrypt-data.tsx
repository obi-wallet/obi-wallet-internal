import { Button, Text, Transaction } from "@/components";
import { EffectStateDispatch } from "@/hooks/use-effect-state";
import { AsyncButton } from "@/ui/button";
import { ApproveIntentions } from "@/user-interactions/approve-intentions";
import { IntentionsResults } from "@/user-interactions/approve-intentions/utils";
import { SendingAnimation } from "@/user-interactions/approve-messages/sending-animation";
import {
  WalletDataFlowState,
  WalletDataFlowStateType,
  WalletDataState,
} from "@/wallet-data-flow/state";
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
  const owner = state.owner;
  const keyMetaData = state.keyMetaData;

  const [results, setResults] = useState<IntentionsResults | undefined>(
    undefined,
  );

  const approve = useMutation({
    mutationFn: async () => {
      invariant(results, "Results not found");

      await dispatch(state.setIntentionsResults(results));
    },
    onError(error) {
      console.error(error);
    },
  });

  function getTransactionProps() {
    switch (state.previousState._tag) {
      case WalletDataFlowStateType.Initial:
        return {
          descriptions: ["Recover Wallet"],
          rawData: {
            userEntryAddress: state.walletData.userEntryAddress,
            owner: state.walletData.owner,
          },
        };
      case WalletDataFlowStateType.SecuritySettings:
        return {
          descriptions: ["Backup non-sensitive wallet information"],
          rawData: {
            homeChainId: state.walletData.homeChainId,
            userEntryAddress: state.walletData.userEntryAddress,
            owner: state.walletData.owner,
            encryptedShares: {
              easy: "...",
              backup: "...",
            },
            encryptedKeyMetaData: "...",
            ed25519KeyPair: state.walletData.ed25519KeyPair
              ? {
                  publicKey: state.walletData.ed25519KeyPair.publicKey,
                  encryptedPrivateKey: "...",
                }
              : undefined,
          },
        };
    }
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
            {...getTransactionProps()}
          />

          <ApproveIntentions
            multisigKey={owner}
            keyMetaData={keyMetaData}
            intentions={state.intentionsPayload}
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
