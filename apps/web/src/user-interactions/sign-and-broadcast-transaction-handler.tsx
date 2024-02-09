"use client";

import { Button, Text, Transaction } from "@/components";
import { useStore } from "@/contexts";
import { TargetChain } from "@/target-chain";
import { isCosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import { CosmosSdkMpcSigner } from "@/target-chain/cosmos-sdk/mpc-signer";
import { EncodeObject } from "@cosmjs/proto-signing";
import { isDeliverTxSuccess } from "@cosmjs/stargate";
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

  const broadcast = useMutation({
    mutationFn: async () => {
      invariant(wallet, "Wallet not found");

      const chainId = interaction.payload.targetChainId;
      invariant(
        isCosmosSdkChainId(chainId),
        "ChainId is not a Cosmos SDK chain",
      );

      const signer = await CosmosSdkMpcSigner.fromWallet(wallet, chainId);
      const accounts = await signer.getAccounts();
      const firstAccount = accounts[0];
      invariant(firstAccount, "No account found");

      const response = await TargetChain.chainId(
        chainId,
      ).withSigningStargateClient(signer, async (client) => {
        return await client.signAndBroadcast(
          firstAccount.address,
          interaction.payload.messages as EncodeObject[],
          "auto",
        );
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
