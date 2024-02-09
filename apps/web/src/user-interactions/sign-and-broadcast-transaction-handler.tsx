"use client";

import { toAssets } from "@/app/dashboard/fast-travel/assets";
import { Button, Text, Transaction } from "@/components";
import { useStore } from "@/contexts";
import { TargetChain, TargetChainId } from "@/target-chain";
import { isCosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import { Coin } from "@cosmjs/amino";
import { EncodeObject } from "@cosmjs/proto-signing";
import { isDeliverTxSuccess, MsgSendEncodeObject } from "@cosmjs/stargate";
import { useQuery } from "@obi-wallet/headless-ui";
import { NewSignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import invariant from "tiny-invariant";

export const SignAndBroadcastTransactionUserInteractionHandler = observer<{
  children: ReactNode;
}>(function SignAndBroadcastTransactionUserInteractionHandler({ children }) {
  const { userInteractionsStore } = useStore();

  const interaction = userInteractionsStore.getPendingUserInteractionsOfType(
    NewSignAndBroadcastTransactionUserInteraction,
  )[0];

  if (!interaction) return children;

  return (
    <SignAndBroadcastTransactionUserInteractionHandlerInner
      interaction={interaction}
    />
  );
});

export const SignAndBroadcastTransactionUserInteractionHandlerInner = observer<{
  interaction: NewSignAndBroadcastTransactionUserInteraction;
}>(function SignAndBroadcastTransactionUserInteractionHandlerInner({
  interaction,
}) {
  const { mpcWalletsStore } = useStore();
  const wallet = mpcWalletsStore.getWalletByUserEntryAddress(
    interaction.payload.walletMeta.userEntryAddress,
  );

  const fee = useQuery({
    queryKey: ["simulate", interaction.payload.messages],
    queryFn: async () => {
      invariant(wallet, "Wallet not found");

      const chainId = interaction.payload.targetChainId;
      invariant(
        isCosmosSdkChainId(chainId),
        "ChainId is not a Cosmos SDK chain",
      );

      return await TargetChain.chainId(chainId).calculateFee({
        wallet,
        messages: interaction.payload.messages,
      });
    },
  });

  const broadcast = useMutation({
    mutationFn: async () => {
      invariant(wallet, "Wallet not found");
      invariant(fee.data, "Fee could not be calculated");

      const chainId = interaction.payload.targetChainId;
      invariant(
        isCosmosSdkChainId(chainId),
        "ChainId is not a Cosmos SDK chain",
      );

      const response = await TargetChain.chainId(chainId).signAndBroadcast({
        wallet,
        fee: fee.data!,
        messages: interaction.payload.messages,
      });
      interaction.resolve({
        approved: true,
        payload: {
          success: isDeliverTxSuccess(response),
          rawLog: response.rawLog,
          transactionHash: response.transactionHash,
          rawResult: response,
        },
      });
    },
  });

  return (
    <div className="w-full">
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
            messages={interaction.payload.messages}
            targetChainId={interaction.payload.targetChainId}
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
            <Button
              block
              variant="outline"
              onClick={() => {
                interaction.resolve({
                  approved: false,
                });
              }}
            >
              Reject
            </Button>
            <Button
              block
              disabled={broadcast.isLoading}
              onClick={() => {
                broadcast.mutate();
              }}
            >
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

const PrettyPrint = observer(function PrettyPrint({
  messages,
  targetChainId,
  fee,
}: {
  messages: unknown[];
  targetChainId: string;
  fee: unknown;
}) {
  if (isCosmosSdkChainId(targetChainId)) {
    return (
      <PrettyPrintCosmosSdk
        messages={messages}
        targetChainId={targetChainId}
        fee={fee}
      />
    );
  }
});

const PrettyPrintCosmosSdk = observer(function PrettyPrintCosmosSdk({
  messages,
  targetChainId,
  fee,
}: {
  messages: unknown[];
  targetChainId: TargetChainId;
  fee: unknown | undefined;
}) {
  const targetChain = TargetChain.chainId(targetChainId);
  invariant(targetChain.validateMessages(messages), "Invalid messages");

  const feeInfo =
    fee && targetChain.validateFee(fee)
      ? fee.amount.map(prettyPrintCoin)
      : [
          {
            amount: "",
            denom: "Simulating",
          },
        ];
  const amounts = messages.map(messageToAmount).flat().map(prettyPrintCoin);
  const descriptions = messages.map(messageToDescription).flat();
  const rawData = messages.map(messageToRawData);

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

function messageToAmount(message: EncodeObject) {
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

function messageToDescription(message: EncodeObject) {
  switch (message.typeUrl) {
    case "/cosmos.bank.v1beta1.MsgSend": {
      const { value } = message as MsgSendEncodeObject;
      const amount = messageToAmount(message);
      return amount.map((amount) => {
        const prettyAmount = prettyPrintCoin(amount);
        return `Send ${prettyAmount.amount} ${prettyAmount.denom} to ${value.toAddress}`;
      });
    }
    default:
      console.warn("Unknown message type: ", message.typeUrl);
      return [];
  }
}

function messageToRawData(message: EncodeObject) {
  return toJS(message);
}

function prettyPrintCoin(coin: Coin): {
  amount: string;
  denom: string;
} {
  const toAsset = Object.values(toAssets).find((value) => {
    return value.denom === coin.denom;
  });
  invariant(toAsset, "Asset not found");
  return {
    amount: new BigNumber(coin.amount)
      .dividedBy(10 ** toAsset?.decimals)
      .toString(10),
    denom: toAsset.label,
  };
}
