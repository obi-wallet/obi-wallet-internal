import { Button, Text, Transaction } from "@/components";
import { useStore } from "@/contexts";
import { IntentionsPayload } from "@/keys/intentions-handler";
import { TargetChain, TargetChainId } from "@/target-chain";
import {
  ApproveIntentions,
  IntentionsResults,
} from "@/user-interactions/approve-intentions";
import { Coin } from "@cosmjs/amino";
import { EncodeObject } from "@cosmjs/proto-signing";
import { MsgSendEncodeObject, StdFee } from "@cosmjs/stargate";
import { useQuery } from "@obi-wallet/headless-ui";
import { MpcWallet } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import Lottie from "lottie-react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import invariant from "tiny-invariant";

import SendingAnimation from "./sending-animation.json";

export interface ApproveMessagesProps {
  walletMeta: {
    userEntryAddress: string;
  };
  targetChainId: TargetChainId;
  messages: unknown[];
  memo: string;
  rawData: unknown;
  onReject(): void;
  onApprove(args: {
    wallet: MpcWallet;
    fee: StdFee;
    intentionsPayload: IntentionsPayload;
    intentionsResults: IntentionsResults;
  }): Promise<void>;
}

export const ApproveMessages = observer<ApproveMessagesProps>(
  function ApproveMessages({
    walletMeta,
    targetChainId,
    messages,
    memo,
    rawData,
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

    const txInfo = useQuery({
      queryKey: ["simulate", { walletMeta, targetChainId, messages }],
      queryFn: async () => {
        invariant(wallet, "Wallet not found");
        const targetChain = TargetChain.chainId(targetChainId);

        const fee = await targetChain.calculateFee({
          wallet,
          messages,
          memo,
        });

        invariant(fee, "Fee could not be calculated");

        const hash = await targetChain.calculateHashToSign({
          wallet,
          fee,
          messages,
          memo,
        });

        invariant(hash, "Hash could not be calculated");

        return {
          fee,
          hash: Buffer.from(hash).toString("hex"),
        };
      },
      retry: false,
    });

    const approve = useMutation({
      mutationFn: async () => {
        invariant(wallet, "Wallet not found");
        invariant(txInfo.data, "txInfo could not be calculated");
        invariant(intentionsPayload, "Intentions payload not found");
        invariant(intentionsResults, "Intentions results not found");

        await onApprove({
          wallet,
          fee: txInfo.data.fee,
          intentionsResults,
          intentionsPayload,
        });
      },
    });

    if (!wallet) return null;

    const keyMetaData = keyMetaDataStore.getKeyMetaData(
      wallet.userEntryAddress,
    );
    const intentionsPayload: IntentionsPayload | null = txInfo.data
      ? {
          signHashes: [new Uint8Array(Buffer.from(txInfo.data.hash, "hex"))],
          decryptMessages: [],
          decryptMultisigKeyEncryptedMessages: [],
        }
      : null;

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

            <PrettyPrint
              messages={messages}
              rawData={rawData}
              targetChainId={targetChainId}
              fee={txInfo.data?.fee}
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

            <div className="mt-6 flex w-full flex-row space-x-6 ">
              <Button block variant="outline" onClick={onReject}>
                Reject
              </Button>
              <Button
                block
                disabled={
                  !txInfo.isSuccess || approve.isPending || !intentionsResults
                }
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

const PrettyPrint = observer(function PrettyPrint({
  messages,
  rawData,
  targetChainId,
  fee,
}: {
  messages: unknown[];
  targetChainId: TargetChainId;
  rawData: unknown;
  fee: unknown;
}) {
  return (
    <PrettyPrintCosmosSdk
      messages={messages}
      rawData={rawData}
      targetChainId={targetChainId}
      fee={fee}
    />
  );
});

const PrettyPrintCosmosSdk = observer(function PrettyPrintCosmosSdk({
  messages,
  rawData,
  targetChainId,
  fee,
}: {
  messages: unknown[];
  rawData: unknown;
  targetChainId: TargetChainId;
  fee: unknown | undefined;
}) {
  const targetChain = TargetChain.chainId(targetChainId);
  invariant(targetChain.validateMessages(messages), "Invalid messages");

  const feeInfo =
    fee && targetChain.validateFee(fee)
      ? fee.amount.map((coin) => prettyPrintCoin({ coin, targetChainId }))
      : [
          {
            amount: "",
            denom: "Simulating…",
          },
        ];
  const amounts = messages
    .map((message) => messageToAmount({ message, targetChainId }))
    .flat()
    .map((coin) => prettyPrintCoin({ coin, targetChainId }));
  const descriptions = messages
    .map((message) => messageToDescription({ message, targetChainId }))
    .flat();

  return (
    <Transaction
      amountInfo={amounts}
      descriptions={descriptions}
      targetChainId={targetChainId}
      feeInfo={feeInfo}
      rawData={rawData}
    />
  );
});

function messageToAmount({
  message,
}: {
  message: EncodeObject;
  targetChainId: TargetChainId;
}): Coin[] {
  switch (message.typeUrl) {
    case "/cosmos.bank.v1beta1.MsgSend": {
      const { value } = message as MsgSendEncodeObject;
      return value.amount ?? [];
    }
    default:
      console.warn("Unknown message type: ", message.typeUrl);
      return [];
  }
}

function messageToDescription({
  message,
  targetChainId,
}: {
  message: EncodeObject;
  targetChainId: TargetChainId;
}) {
  switch (message.typeUrl) {
    case "/cosmos.bank.v1beta1.MsgSend": {
      const { value } = message as MsgSendEncodeObject;
      const amount = messageToAmount({ message, targetChainId });
      return amount.map((amount) => {
        const prettyAmount = prettyPrintCoin({
          coin: amount,
          targetChainId,
        });
        return `Send ${prettyAmount.amount} ${prettyAmount.denom} to ${value.toAddress}`;
      });
    }
    default:
      console.warn("Unknown message type: ", message.typeUrl);
      return [];
  }
}

function prettyPrintCoin({
  coin,
  targetChainId,
}: {
  coin: Coin;
  targetChainId: TargetChainId;
}): {
  amount: string;
  denom: string;
} {
  const asset = TargetChain.chainId(targetChainId).getAsset(coin.denom);
  if (!asset) {
    return {
      amount: coin.amount,
      denom: coin.denom,
    };
  }

  const denomUnit = asset.denom_units.find((value) => {
    return value.denom === asset.display;
  });
  return {
    amount: new BigNumber(coin.amount)
      .dividedBy(10 ** (denomUnit?.exponent ?? 0))
      .toString(),
    denom: asset.symbol,
  };
}
