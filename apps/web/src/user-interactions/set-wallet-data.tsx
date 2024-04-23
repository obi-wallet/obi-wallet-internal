"use client";

import { Button, Text, Transaction } from "@/components";
import { useStore } from "@/contexts";
import { HomeChain } from "@/home-chain";
import {
  ApproveIntentions,
  IntentionsResults,
} from "@/user-interactions/approve-intentions";
import SendingAnimation from "@/user-interactions/approve-messages/sending-animation.json";
import { SetWalletDataUserInteraction } from "@/user-interactions/set-wallet-data-user-interaction";
import { useQuery } from "@obi-wallet/headless-ui";
import { createHash, MultisigKey, WalletData } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import Lottie from "lottie-react";
import { observer } from "mobx-react-lite";
import { ReactNode, useState } from "react";
import invariant from "tiny-invariant";

export const SetWalletDataUserInteractionHandler = observer<{
  children: ReactNode;
}>(function SetWalletDataUserInteractionHandler({ children }) {
  const { userInteractionsStore } = useStore();

  const interaction = userInteractionsStore.getPendingUserInteractionsOfType(
    SetWalletDataUserInteraction,
  )[0];

  if (!interaction) return children;

  return <SetWalletDataUserInteractionHandlerInner interaction={interaction} />;
});

export const SetWalletDataUserInteractionHandlerInner = observer<{
  interaction: SetWalletDataUserInteraction;
}>(function SetWalletDataUserInteractionHandlerInner({ interaction }) {
  const owner = MultisigKey.create(
    interaction.payload.homeChainId,
    interaction.payload.owner,
  );
  const keyMetaData = interaction.payload.keyMetaData;
  const walletData = WalletData.parse(
    JSON.parse(interaction.payload.serializedWalletData),
  );

  const [results, setResults] = useState<IntentionsResults | undefined>(
    undefined,
  );

  const userAccount = useQuery({
    queryKey: ["user-account", walletData.userEntryAddress],
    queryFn: async () => {
      const homeChain = HomeChain.chainId(walletData.homeChainId);
      const userEntryCodeHash = await homeChain.userEntryCodeHash(
        walletData.userEntryAddress,
      );
      return await homeChain.userAccount({
        userEntryAddress: walletData.userEntryAddress,
        userEntryCodeHash,
      });
    },
  });

  const approve = useMutation({
    mutationFn: async () => {
      invariant(results, "Results not found");
      invariant(userAccount.data, "User account not found");

      const signatures = [...results.values()]
        .map((value) => {
          return value.signedHashes[0];
        })
        .filter((signature): signature is Uint8Array => {
          return !!signature;
        })
        .map((signature) => {
          return Buffer.from(signature).toString("hex");
        });

      const response = await fetch("/api/set-wallet-data", {
        method: "POST",
        body: JSON.stringify({
          serializedWalletData: interaction.payload.serializedWalletData,
          signatures: signatures,
          userAccountAddress: userAccount.data.userAccountAddress,
          userAccountCodeHash: userAccount.data.userAccountCodeHash,
        }),
      });

      if (response.status === 200 && (await response.json()).success) {
        interaction.resolve({ approved: true });
      }
    },
    onError(error) {
      console.error(error);
    },
  });

  return (
    <div className="relative w-full md:mt-24">
      <div className="flex justify-center">
        <div className="flex flex-col items-center">
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
            descriptions={["Backup non-sensitive wallet information"]}
            memo=""
            rawData={{
              homeChainId: walletData.homeChainId,
              userEntryAddress: walletData.userEntryAddress,
              owner: walletData.owner,
              encryptedShares: {
                easy: "...",
                backup: "...",
              },
              encryptedKeyMetaData: "...",
            }}
          />

          <ApproveIntentions
            multisigKey={owner}
            keyMetaData={keyMetaData}
            intentions={{
              signHashes: [
                createHash(
                  Buffer.from(
                    interaction.payload.serializedWalletData,
                    "utf-8",
                  ),
                ),
              ],
              decryptMessages: [],
              decryptMultisigKeyEncryptedMessages: [],
            }}
            onApprove={(results) => {
              setResults(results);
            }}
          />

          <div className="mt-6 grid w-full grid-cols-2 gap-6 ">
            <Button
              block
              variant="outline"
              onClick={() => {
                interaction.resolve({ approved: false });
              }}
            >
              Reject
            </Button>
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
});
