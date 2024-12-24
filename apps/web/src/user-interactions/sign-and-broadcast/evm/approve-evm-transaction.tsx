import { Button, Text, Transaction } from "@/components";
import { useStore } from "@/contexts";
import { HomeChain } from "@/home-chain";
import { IntentionsPayload } from "@/keys/intentions-handler";
import { TargetChain } from "@/target-chain";
import {
  deserializeUserOperation,
  deserializeUserOperationCalls,
  SerializedEvmUserOperation,
  SerializedEvmUserOperationCalls,
} from "@/target-chain/eip-155";
import { Eip155ChainId } from "@/target-chain/eip-155/chains";
import { ApproveIntentions } from "@/user-interactions/approve-intentions";
import { IntentionsResults } from "@/user-interactions/approve-intentions/utils";
import { SendingAnimation } from "@/user-interactions/approve-messages/sending-animation";
import { useQuery } from "@obi-wallet/headless-ui";
import { MpcWallet } from "@obi-wallet/sdk";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import { serialize } from "@obi-wallet/sdk-json";
import { skipToken, useMutation } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import invariant from "tiny-invariant";
import { decodeFunctionData, erc20Abi } from "viem";
import { z } from "zod";

export interface ApproveEvmTransactionProps {
  walletMeta: {
    id: string;
  };
  targetChainId: Eip155ChainId;
  calls: SerializedEvmUserOperationCalls;
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
    calls,
    onApprove,
    onReject,
  }) {
    const { keyMetaDataStore, mpcWalletsStore } = useStore();
    const wallet = mpcWalletsStore.getWalletById(walletMeta.id);
    const [intentionsResults, setIntentionsResults] = useState<
      IntentionsResults | undefined
    >();

    const targetChain = TargetChain.chainId(targetChainId);

    const userOperation = useQuery({
      queryKey: ["user-operation", { walletMeta, targetChainId, calls }],
      queryFn: wallet
        ? async () => {
            const secp256k1PublicKey = await HomeChain.chainId(
              wallet.homeChainId,
            ).secp256k1PublicKey(wallet);
            const response = await fetch(
              "/api/evm/prepare-user-operation-request",
              {
                method: "POST",
                body: serialize({
                  targetChainId,
                  secp256k1PublicKey,
                  calls,
                }),
              },
            );
            const schema = z.object({
              success: z.boolean(),
              userOperation: SerializedEvmUserOperation,
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
      refetchOnMount: "always",
      refetchOnReconnect: false,
    });
    const userOperationData = userOperation.isFetchedAfterMount
      ? userOperation.data
      : undefined;

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

    const keyMetaData = keyMetaDataStore.getKeyMetaData(wallet.id);
    const intentionsPayload: IntentionsPayload | null = userOperationData
      ? {
          signHashes: [
            new Uint8Array(Buffer.from(userOperationData.hash, "hex")),
          ],
          decryptShares: {
            easy: wallet.encryptedEasyShare,
            backup: wallet.encryptedBackupShare,
            network: null,
          },
          decryptMessages: [],
          decryptPrimaryKeyEncryptedMessages: [],
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

          <PrettyPrint
            calls={calls}
            targetChainId={targetChainId}
            userOperation={userOperationData?.userOperation}
          />

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

          <div className="mt-6 flex w-full flex-row space-x-6">
            <Button block variant="outline" onClick={onReject}>
              Reject
            </Button>
            <Button
              block
              disabled={
                !userOperationData || approve.isPending || !intentionsResults
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

const PrettyPrint = observer(function PrettyPrint({
  calls,
  targetChainId,
}: {
  calls: SerializedEvmUserOperationCalls;
  userOperation?: SerializedEvmUserOperation | undefined;
  targetChainId: Eip155ChainId;
}) {
  const prettyPrintData = useQuery({
    queryKey: ["pretty-print-data", calls],
    queryFn: async () => {
      const targetChain = TargetChain.chainId(targetChainId);

      const getAmountInfo = async ({
        id,
        rawAmount,
      }: {
        id: Caip19AssetId;
        rawAmount: string;
      }) => {
        const asset = await targetChain.assetInfo(id);
        return {
          denom: asset?.symbol ?? id,
          amount: new BigNumber(rawAmount)
            .dividedBy(10 ** (asset?.decimals ?? 0))
            .toString(),
        };
      };

      return (
        await Promise.all(
          deserializeUserOperationCalls(calls).map(async (call) => {
            // Native transfer
            if (!call.data || call.data === "0x") {
              const value = call.value ?? 0n;

              return {
                to: call.to,
                amountInfo: await getAmountInfo({
                  id: targetChain.nativeCaip19AssetId,
                  rawAmount: value.toString(10),
                }),
              };
            }

            try {
              const data = decodeFunctionData({
                abi: erc20Abi,
                data: call.data,
              });

              if (data.functionName === "transfer") {
                const to = data.args[0];
                const rawAmount = data.args[1];

                const id = targetChain.denomToCaip19AssetId(call.to);

                if (id) {
                  return {
                    to,
                    amountInfo: await getAmountInfo({
                      id,
                      rawAmount: rawAmount.toString(10),
                    }),
                  };
                }
              }
            } catch (error) {
              console.error(error);
            }

            return null;
          }),
        )
      ).filter((data) => {
        return !!data;
      });
    },
  });

  if (!prettyPrintData.data) {
    return null;
  }

  const tos = prettyPrintData.data.map((data) => {
    return data.to;
  });
  const amountInfos = prettyPrintData.data.map((data) => {
    return data.amountInfo;
  });

  return (
    <Transaction
      amountInfo={amountInfos}
      feeInfo={[]}
      descriptions={[]}
      addresses={tos}
      memo=""
      targetChainId={targetChainId}
      rawData={deserializeUserOperationCalls(calls)}
    />
  );
});
