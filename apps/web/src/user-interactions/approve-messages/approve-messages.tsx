import { Button, Text, Transaction } from "@/components";
import { useStore } from "@/contexts";
import { TargetChain, TargetChainId } from "@/target-chain";
import { Coin } from "@cosmjs/amino";
import { EncodeObject } from "@cosmjs/proto-signing";
import { MsgSendEncodeObject, StdFee } from "@cosmjs/stargate";
import { useQuery } from "@obi-wallet/headless-ui";
import { MpcWallet } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import Lottie from "lottie-react";
import { observer } from "mobx-react-lite";
import invariant from "tiny-invariant";

import SendingAnimation from "./sending-animation.json";

export interface ApproveMessagesProps {
  walletMeta: {
    userEntryAddress: string;
  };
  targetChainId: TargetChainId;
  messages: unknown[];
  rawData: unknown;
  onReject(): void;
  onApprove(args: { wallet: MpcWallet; fee: StdFee }): Promise<void>;
}

export const ApproveMessages = observer<ApproveMessagesProps>(
  function ApproveMessages({
    walletMeta,
    targetChainId,
    messages,
    rawData,
    onApprove,
    onReject,
  }) {
    const { mpcWalletsStore } = useStore();
    const wallet = mpcWalletsStore.getWalletByUserEntryAddress(
      walletMeta.userEntryAddress,
    );

    const fee = useQuery({
      queryKey: ["simulate", { walletMeta, targetChainId, messages }],
      queryFn: async () => {
        invariant(wallet, "Wallet not found");

        return await TargetChain.chainId(targetChainId).calculateFee({
          wallet,
          messages,
        });
      },
    });

    const approve = useMutation({
      mutationFn: async () => {
        invariant(wallet, "Wallet not found");
        invariant(fee.data, "Fee could not be calculated");

        await onApprove({
          wallet,
          fee: fee.data,
        });
      },
    });

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
              fee={fee.data}
            />

            {/*<Text className="mt-4">{`${threshold} Key${*/}
            {/*  threshold > 1 ? "s" : ""*/}
            {/*} Required`}</Text>*/}
            {/*<Button*/}
            {/*  className="mt-4"*/}
            {/*  block*/}
            {/*  onClick={() => {*/}
            {/*    // TODO:*/}
            {/*  }}*/}
            {/*  variant={threshold > confirmedKeyCount ? "primary" : "confirmed"}*/}
            {/*  // disabled={threshold === confirmedKeyCount}*/}
            {/*>*/}
            {/*  Passkey*/}
            {/*</Button>*/}

            <div className="mt-6 flex w-full flex-row space-x-6 ">
              <Button block variant="outline" onClick={onReject}>
                Reject
              </Button>
              <Button
                block
                disabled={!fee.isSuccess || approve.isLoading}
                onClick={() => {
                  approve.mutate();
                }}
              >
                Approve
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute top-0 flex h-full w-full flex-1">
          {approve.isLoading && (
            <div className="absolute top-0 flex h-full w-full flex-1 flex-col items-center justify-center bg-black bg-opacity-50">
              <div className="    w-60  rounded-xl  bg-blue-600 p-5">
                <Lottie animationData={SendingAnimation} />;
                <Text size="xl" className="justify-center  text-white">
                  Sending
                </Text>
              </div>
            </div>
          )}
        </div>
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
