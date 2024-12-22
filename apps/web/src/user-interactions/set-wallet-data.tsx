"use client";

import { Button, Text, Transaction } from "@/components";
import { useStore } from "@/contexts";
import { HomeChain } from "@/home-chain";
import { ApproveIntentions } from "@/user-interactions/approve-intentions";
import { IntentionsResults } from "@/user-interactions/approve-intentions/utils";
import { SetWalletDataUserInteraction } from "@/user-interactions/set-wallet-data-user-interaction";
import { Encoding } from "@obi-wallet/encoding";
import { useQuery } from "@obi-wallet/headless-ui";
import { createHash, MultisigKey, WalletData } from "@obi-wallet/sdk";
import { deserialize, serialize } from "@obi-wallet/sdk-json";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { ReactNode, useState } from "react";
import invariant from "tiny-invariant";

import { SendingAnimation } from "./approve-messages/sending-animation";

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
    deserialize(interaction.payload.serializedWalletData),
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
          return Encoding.fromBytes(signature).toHex();
        });

      const response = await fetch("/api/set-wallet-data", {
        method: "POST",
        body: serialize({
          serializedWalletData: interaction.payload.serializedWalletData,
          signatures,
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
              ed25519KeyPair: walletData.ed25519KeyPair
                ? {
                    publicKey: walletData.ed25519KeyPair.publicKey,
                    encryptedPrivateKey: "...",
                  }
                : undefined,
            }}
          />

          <ApproveIntentions
            multisigKey={owner}
            keyMetaData={keyMetaData}
            intentions={{
              signHashes: [
                createHash(
                  Encoding.fromUtf8(
                    interaction.payload.serializedWalletData,
                  ).toBytes(),
                ),
              ],
              decryptShares: null,
              decryptMessages: [],
              decryptPrimaryKeyEncryptedMessages: [],
              decryptMultisigKeyEncryptedMessages: [],
            }}
            onApprove={(results) => {
              setResults(results);
            }}
          />

          <div className="mt-6 grid w-full grid-cols-2 gap-6">
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

      {approve.isPending && <SendingAnimation />}
    </div>
  );
});
