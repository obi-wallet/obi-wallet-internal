"use client";

import { Button, Text, Transaction } from "@/components";
import { useStore } from "@/contexts";
import { TargetChain } from "@/target-chain";
import { isCosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import { isDeliverTxSuccess } from "@cosmjs/stargate";
import { useQuery } from "@obi-wallet/headless-ui";
import { NewSignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
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

  console.log(fee.data);

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

          {/* TODO: */}
          <Transaction
            amountInfo={{ amount: 1250, unit: "NTRN" }}
            description="Stake 1,250.00 NTRN to xyz validator"
            network="Neutron"
            feeInfo={{ amount: 0.03021, unit: "NTRN" }}
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
