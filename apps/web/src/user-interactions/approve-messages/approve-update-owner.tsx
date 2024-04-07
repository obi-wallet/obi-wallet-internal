import { Button, Text, Transaction } from "@/components";
import { useStore } from "@/contexts";
import { HomeChain } from "@/home-chain";
import { IntentionsResult } from "@/keys/intentions-handler";
import { ApproveIntentions } from "@/user-interactions/approve-intentions";
import { useQuery } from "@obi-wallet/headless-ui";
import { MultisigKey, SecretJsClient } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { diffString } from "json-diff";
import Lottie from "lottie-react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";

import SendingAnimation from "./sending-animation.json";

export interface ApproveUpdateOwnerProps {
  walletMeta: {
    userEntryAddress: string;
  };
  previousOwner: MultisigKey;
  nextOwner: MultisigKey;

  onReject(): void;

  onApprove(): void;
}

export const ApproveUpdateOwner = observer<ApproveUpdateOwnerProps>(
  function ApproveUpdateOwner({
    walletMeta,
    previousOwner,
    nextOwner,
    onApprove,
    onReject,
  }) {
    const { mpcWalletsStore } = useStore();
    const wallet = mpcWalletsStore.getWalletByUserEntryAddress(
      walletMeta.userEntryAddress,
    );
    const [proposedUpdate, setProposedUpdate] = useState(false);
    const [results, setResults] = useState<
      Map<string, IntentionsResult> | undefined
    >(undefined);

    const userAccount = useQuery({
      queryKey: ["user-account", { walletMeta }],
      queryFn: async () => {
        const homeChain = HomeChain.chainId(nextOwner.chainId);
        const userEntryCodeHash = await homeChain.userEntryCodeHash(
          walletMeta.userEntryAddress,
        );
        return await homeChain.userAccount({
          userEntryAddress: walletMeta.userEntryAddress,
          userEntryCodeHash,
        });
      },
    });

    const nextHash = useQuery({
      queryKey: ["next-hash", { walletMeta }],
      queryFn: async () => {
        invariant(userAccount.data, "User account not found");
        const client = new SecretJsClient(nextOwner.chainId);
        const { next_hash } = await client.queryContract({
          contract: userAccount.data.userAccountAddress,
          codeHash: userAccount.data.userAccountCodeHash,
          query: {
            next_hash: {},
          },
          schema: z.object({
            next_hash: z.string(),
          }),
        });
        return Buffer.from(next_hash, "hex");
      },
      staleTime: 0,
      enabled: !!userAccount.data,
    });

    const approve = useMutation({
      mutationFn: async () => {
        invariant(wallet, "Wallet not found");
        invariant(userAccount.data, "Message not found");
        invariant(results, "Results not found");

        if (proposedUpdate) {
          const response = await fetch("/api/confirm-update-owner", {
            method: "POST",
            body: JSON.stringify({
              homeChainId: nextOwner.chainId,
              userAccountAddress: userAccount.data.userAccountAddress,
              userAccountCodeHash: userAccount.data.userAccountCodeHash,
              signatures: [...results.values()].map((value) => {
                return Buffer.from(value.signedHashes[0]!).toString("hex");
              }),
            }),
          });

          if (response.status !== 200) {
            throw new Error(`Failed to update owner: ${response.status}`);
          }

          const result: { success: boolean } = await response.json();
          if (!result.success) {
            throw new Error("Failed to update owner");
          }

          onApprove();

          return;
        }

        const response = await fetch("/api/propose-update-owner", {
          method: "POST",
          body: JSON.stringify({
            homeChainId: nextOwner.chainId,
            newOwner: nextOwner.toJSON(),
            userAccountAddress: userAccount.data.userAccountAddress,
            userAccountCodeHash: userAccount.data.userAccountCodeHash,
            signatures: [...results.values()].map((value) => {
              return Buffer.from(value.signedHashes[0]!).toString("hex");
            }),
          }),
        });

        if (response.status !== 200) {
          throw new Error(`Failed to update owner: ${response.status}`);
        }

        const result: { success: boolean } = await response.json();
        if (!result.success) {
          throw new Error("Failed to update owner");
        }

        await nextHash.refetch();
        setResults(undefined);
        setProposedUpdate(true);
      },
      onError(error) {
        console.error(error);
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

            <Transaction
              amountInfo={[]}
              feeInfo={[]}
              descriptions={[
                proposedUpdate ? `Confirm new owner` : `Propose new owner`,
              ]}
              rawData={`
Changes:
                
${diffString(previousOwner.toJSON(), nextOwner.toJSON())}
              
Proposed Owner:
                
${JSON.stringify(nextOwner.toJSON(), null, 2)}

Current Owner:
                
${JSON.stringify(previousOwner.toJSON(), null, 2)}
              `}
            />

            {/*<PrettyPrint*/}
            {/*  messages={messages}*/}
            {/*  rawData={rawData}*/}
            {/*  targetChainId={targetChainId}*/}
            {/*  fee={fee.data}*/}
            {/*/>*/}

            {nextHash.data ? (
              <ApproveIntentions
                key={`${proposedUpdate}-${nextHash.data}`}
                multisigKey={proposedUpdate ? nextOwner : previousOwner}
                intentions={{
                  signHashes: [nextHash.data],
                  decryptMessages: [],
                }}
                onApprove={(results) => {
                  setResults(results);
                }}
              />
            ) : null}

            <div className="mt-6 flex w-full flex-row space-x-6 ">
              <Button block variant="outline" onClick={onReject}>
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
  },
);
