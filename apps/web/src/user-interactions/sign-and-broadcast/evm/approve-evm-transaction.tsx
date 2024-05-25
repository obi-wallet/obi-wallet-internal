import { Button, Text } from "@/components";
import { useStore } from "@/contexts";
import { IntentionsPayload } from "@/keys/intentions-handler";
import { TargetChain } from "@/target-chain";
import {
  deserializeUserOperation,
  SerializedEvmUserOperation,
} from "@/target-chain/evm";
import { EvmChainId } from "@/target-chain/evm/chains";
import {
  ApproveIntentions,
  IntentionsResults,
} from "@/user-interactions/approve-intentions";
import { SendingAnimation } from "@/user-interactions/approve-messages/sending-animation";
import { HexEncodedStringWithPrefix } from "@obi-wallet/encoding";
import { useQuery } from "@obi-wallet/headless-ui";
import { MpcWallet } from "@obi-wallet/sdk";
import { skipToken, useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";

export interface ApproveEvmTransactionProps {
  walletMeta: {
    userEntryAddress: string;
  };
  targetChainId: EvmChainId;
  callData: HexEncodedStringWithPrefix;
  onReject(): void;
  onApprove(args: {
    wallet: MpcWallet;
    userOperation: SerializedEvmUserOperation;
    intentionsPayload: IntentionsPayload;
    intentionsResults: IntentionsResults;
  }): Promise<void>;
}

export const ApproveEvmTransaction = observer<ApproveEvmTransactionProps>(
  function ApproveEvmTransaction({
    walletMeta,
    targetChainId,
    callData,
    onApprove,
    onReject,
  }) {
    const { keyMetaDataStore, mpcWalletsStore } = useStore();
    const wallet = mpcWalletsStore.getWalletByUserEntryAddress(
      walletMeta.userEntryAddress,
    );
    const [intentionsResults, setIntentionsResults] = useState<
      IntentionsResults | undefined
    >();

    const targetChain = TargetChain.chainId(targetChainId);

    const userOperation = useQuery({
      queryKey: ["user-operation", { walletMeta, targetChainId, callData }],
      queryFn: wallet
        ? async () => {
            const response = await fetch(
              "/api/evm/prepare-user-operation-request",
              {
                method: "POST",
                body: JSON.stringify({
                  homeChainId: wallet.homeChainId,
                  targetChainId,
                  userEntryAddress: wallet.userEntryAddress,
                  callData,
                }),
              },
            );
            const schema = z.object({
              success: z.boolean(),
              userOperation: z.custom<SerializedEvmUserOperation>(() => {
                return true;
              }),
            });
            const { success, userOperation } = schema.parse(
              await response.json(),
            );
            if (!success) {
              throw new Error("Failed to prepare user operation request");
            }

            const hash = await targetChain.calculateHashToSign({
              wallet,
              userOperation: deserializeUserOperation(userOperation),
            });

            return {
              userOperation,
              hash: Buffer.from(hash).toString("hex"),
            };
          }
        : skipToken,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    });

    const approve = useMutation({
      mutationFn: async () => {
        invariant(wallet, "Wallet not found");
        invariant(userOperation.data, "userOperation could not be found");
        invariant(intentionsPayload, "Intentions payload not found");
        invariant(intentionsResults, "Intentions results not found");

        await onApprove({
          wallet,
          userOperation: userOperation.data.userOperation,
          intentionsResults,
          intentionsPayload,
        });
      },
      onError: (error) => {
        console.error(error);
      },
    });

    if (!wallet) return null;

    const keyMetaData = keyMetaDataStore.getKeyMetaData(
      wallet.userEntryAddress,
    );
    const intentionsPayload: IntentionsPayload | null = userOperation.data
      ? {
          signHashes: [
            new Uint8Array(Buffer.from(userOperation.data.hash, "hex")),
          ],
          decryptMessages: [],
          decryptMultisigKeyEncryptedMessages: [],
        }
      : null;

    return (
      <div className="mb-5 flex max-h-[calc(100vh_-_80px)] w-full justify-center overflow-auto">
        <div className="flex w-fit flex-col items-center">
          <Text
            leading="loose"
            size="3xl"
            fontWeight="bold"
            className="mb-8 mt-4"
          >
            Complete Transaction
          </Text>

          {/*<PrettyPrint*/}
          {/*    messages={messages}*/}
          {/*    rawData={rawData}*/}
          {/*    targetChainId={targetChainId}*/}
          {/*    fee={txInfo.data?.fee}*/}
          {/*    memo={memo}*/}
          {/*/>*/}

          {intentionsPayload ? (
            <ApproveIntentions
              multisigKey={wallet.owner}
              keyMetaData={keyMetaData}
              intentions={intentionsPayload}
              onApprove={(results) => {
                setIntentionsResults(results);
              }}
            />
          ) : null}

          <div className="mt-6 flex w-full flex-row space-x-6 ">
            <Button block variant="outline" onClick={onReject}>
              Reject
            </Button>
            <Button
              block
              disabled={
                !userOperation.isSuccess ||
                approve.isPending ||
                !intentionsResults
              }
              onClick={() => {
                approve.mutate();
              }}
            >
              Approve
            </Button>
          </div>
        </div>

        {approve.isPending && <SendingAnimation />}
      </div>
    );
  },
);
