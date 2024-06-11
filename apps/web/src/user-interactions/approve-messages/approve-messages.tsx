import { Button, Text, Transaction } from "@/components";
import { useStore } from "@/contexts";
import { IntentionsPayload } from "@/keys/intentions-handler";
import { TargetChain, TargetChainId } from "@/target-chain";
import { CosmosChainId, isCosmosChainId } from "@/target-chain/cosmos/chains";
import {
  ApproveIntentions,
  IntentionsResults,
} from "@/user-interactions/approve-intentions";
import { Coin } from "@cosmjs/amino";
import { EncodeObject } from "@cosmjs/proto-signing";
import { StdFee } from "@cosmjs/stargate";
import { Encoding } from "@obi-wallet/encoding";
import { useQuery } from "@obi-wallet/headless-ui";
import { MpcWallet } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import invariant from "tiny-invariant";

import { SendingAnimation } from "./sending-animation";

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
        invariant(isCosmosChainId(targetChainId), "Invalid chainId");

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

        return {
          fee,
          hash: Encoding.fromBytes(hash).toHex(),
        };
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
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
          signHashes: [Encoding.fromHex(txInfo.data.hash).toBytes()],
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

          <PrettyPrint
            messages={messages}
            rawData={rawData}
            targetChainId={targetChainId}
            fee={txInfo.data?.fee}
            memo={memo}
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

        {approve.isPending && <SendingAnimation />}
      </div>
    );
  },
);

const PrettyPrint = observer(function PrettyPrint({
  messages,
  rawData,
  targetChainId,
  fee,
  memo,
}: {
  messages: unknown[];
  targetChainId: TargetChainId;
  rawData: unknown;
  fee: unknown;
  memo: string;
}) {
  if (!isCosmosChainId(targetChainId)) {
    return null;
  }

  return (
    <PrettyPrintCosmos
      messages={messages}
      rawData={rawData}
      targetChainId={targetChainId}
      fee={fee}
      memo={memo}
    />
  );
});

const PrettyPrintCosmos = observer(function PrettyPrintCosmos({
  messages,
  rawData,
  targetChainId,
  fee,
  memo,
}: {
  messages: unknown[];
  rawData: unknown;
  targetChainId: CosmosChainId;
  fee: unknown | undefined;
  memo: string;
}) {
  const targetChain = TargetChain.chainId(targetChainId);
  invariant(targetChain.validateMessages(messages), "Invalid messages");

  const feeInfo =
    fee && targetChain.validateFee(fee)
      ? fee.amount.map((coin) => {
          return prettyPrintCoin({ coin, targetChainId });
        })
      : [
          {
            amount: "",
            denom: "Simulating…",
          },
        ];
  const amounts = messages
    .map((message) => {
      return messageToAmount({ message, targetChainId });
    })
    .flat()
    .map((coin) => {
      return prettyPrintCoin({ coin, targetChainId });
    });
  const descriptions = messages
    .map((message) => {
      return messageToDescription({ message, targetChainId });
    })
    .flat();
  const addresses = messages
    .map((message) => {
      return messageToAddress({ message });
    })
    .flat();

  return (
    <Transaction
      amountInfo={amounts}
      descriptions={descriptions}
      targetChainId={targetChainId}
      feeInfo={feeInfo}
      rawData={rawData}
      memo={memo}
      addresses={addresses}
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
      const { value } = message;
      return value.amount ?? [];
    }
    default:
      console.warn("Unknown message type: ", message.typeUrl);
      return [];
  }
}

function messageToAddress({ message }: { message: EncodeObject }): string[] {
  switch (message.typeUrl) {
    case "/cosmos.bank.v1beta1.MsgSend": {
      const { value } = message;
      return value.toAddress ? [value.toAddress] : [];
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
  targetChainId: CosmosChainId;
}): string[] {
  switch (message.typeUrl) {
    case "/cosmos.bank.v1beta1.MsgSend": {
      const { value } = message;
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
  targetChainId: CosmosChainId;
}): {
  amount: string;
  denom: string;
} {
  const asset = TargetChain.chainId(targetChainId).assetInfo(coin.denom);
  if (!asset) {
    return {
      amount: coin.amount,
      denom: coin.denom,
    };
  }
  return {
    amount: new BigNumber(coin.amount)
      .dividedBy(10 ** asset.decimals)
      .toString(),
    denom: asset.symbol,
  };
}
