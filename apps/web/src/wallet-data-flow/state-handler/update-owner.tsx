import { Button, Text, Transaction } from "@/components";
import { HomeChain } from "@/home-chain";
import { Secp256k1Decryption } from "@/lib/encryption";
import { KeyMetaData } from "@/stores/key-meta-data";
import {
  ApproveIntentions,
  handleMultisigKeyDecryptedMessage,
  IntentionsResults,
} from "@/user-interactions/approve-intentions";
import SendingAnimation from "@/user-interactions/approve-messages/sending-animation.json";
import { WalletData } from "@/wallet-data-backup";
import { useWalletDataFlowContext } from "@/wallet-data-flow/context";
import { useFinishFlow, useGetWallet } from "@/wallet-data-flow/utils";
import { useQuery } from "@obi-wallet/headless-ui";
import { BackupShare, EasyShare, SecretJsClient } from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { diffString } from "json-diff";
import Lottie from "lottie-react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";

export interface UpdateOwnerProps {
  walletData: WalletData;
}

export const UpdateOwner = observer<UpdateOwnerProps>(function UpdateOwner({
  walletData,
}) {
  const { state, dispatch } = useWalletDataFlowContext();
  const finishFlow = useFinishFlow();
  const getWallet = useGetWallet();

  const userEntryAddress = walletData.proxyAddress.address;

  const previousOwner = state.ownerDraft.original;
  const newOwner = state.ownerDraft.value;

  // TODO:
  const [proposedUpdate, setProposedUpdate] = useState(false);
  const keyMetaData = proposedUpdate
    ? state.keyMetaDataDraft.value.value
    : state.keyMetaDataDraft.original.value;

  const [results, setResults] = useState<IntentionsResults | undefined>(
    undefined,
  );
  const [backupShare, setBackupShare] = useState<BackupShare | undefined>(
    undefined,
  );

  const userAccount = useQuery({
    queryKey: ["user-account", { walletData }],
    queryFn: async () => {
      const homeChain = HomeChain.chainId(newOwner.chainId);
      const userEntryCodeHash =
        await homeChain.userEntryCodeHash(userEntryAddress);
      return await homeChain.userAccount({
        userEntryAddress,
        userEntryCodeHash,
      });
    },
  });

  const nextHash = useQuery({
    queryKey: ["next-hash", { walletData }],
    queryFn: async () => {
      invariant(userAccount.data, "User account not found");
      const client = new SecretJsClient(newOwner.chainId);
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
      async function getProposeOwnerResponse() {
        invariant(userAccount.data, "Message not found");
        invariant(results, "Results not found");

        if (state.mockOnly) {
          return {
            status: 200,
            async json() {
              return { success: true };
            },
          };
        }

        return await fetch("/api/propose-update-owner", {
          method: "POST",
          body: JSON.stringify({
            homeChainId: newOwner.chainId,
            newOwner: newOwner.toJSON(),
            userAccountAddress: userAccount.data.userAccountAddress,
            userAccountCodeHash: userAccount.data.userAccountCodeHash,
            signatures: [...results.values()].map((value) => {
              return Buffer.from(value.signedHashes[0]!).toString("hex");
            }),
          }),
        });
      }

      async function getConfirmOwnerResponse(payload: {
        shares: { easy: EasyShare; backup: BackupShare };
        keyMetaData: KeyMetaData;
      }) {
        invariant(userAccount.data, "Message not found");
        invariant(results, "Results not found");

        if (state.mockOnly) {
          return {
            status: 200,
            async json() {
              return { success: true };
            },
          };
        }

        const wallet = await getWallet(payload);
        return await fetch("/api/confirm-update-owner", {
          method: "POST",
          body: JSON.stringify({
            homeChainId: newOwner.chainId,
            userAccountAddress: userAccount.data.userAccountAddress,
            userAccountCodeHash: userAccount.data.userAccountCodeHash,
            signatures: [...results.values()].map((value) => {
              return Buffer.from(value.signedHashes[0]!).toString("hex");
            }),
            walletData: await HomeChain.chainId(newOwner.chainId).getWalletData(
              { wallet, keyMetaData: payload.keyMetaData },
            ),
            previousOwner: previousOwner.toJSON(),
          }),
        });
      }

      if (proposedUpdate) {
        const getEasyShare = async () => {
          if (state.shares) {
            return state.shares.easy;
          }

          invariant(
            state.locallyEncryptedSharesByPreviousOwner,
            "Shares not found",
          );
          const primaryKey = previousOwner.primaryKey;

          invariant(primaryKey, "Primary key not found");
          const easyShareDecryption = new Secp256k1Decryption(
            primaryKey.payload.privateKey,
          );

          return EasyShare.parse(
            JSON.parse(
              await easyShareDecryption.decrypt(
                state.locallyEncryptedSharesByPreviousOwner.easy,
              ),
            ),
          );
        };
        const easyShare = await getEasyShare();

        invariant(backupShare, "Backup share not found");

        const payload = {
          keyMetaData,
          shares: {
            easy: easyShare,
            backup: backupShare,
          },
        };

        const response = await getConfirmOwnerResponse(payload);

        if (response.status !== 200) {
          throw new Error(`Failed to update owner: ${response.status}`);
        }

        const result: { success: boolean } = await response.json();
        if (!result.success) {
          throw new Error("Failed to update owner");
        }

        await finishFlow({
          ...payload,
          backupWallet: true,
        });
        return;
      }

      const response = await getProposeOwnerResponse();

      if (response.status !== 200) {
        throw new Error(`Failed to update owner: ${response.status}`);
      }

      const result: { success: boolean } = await response.json();
      if (!result.success) {
        throw new Error("Failed to update owner");
      }

      async function getBackupShare() {
        if (state.shares) {
          return state.shares.backup;
        }

        invariant(results, "Results not found");
        invariant(
          state.locallyEncryptedSharesByPreviousOwner,
          "Shares not found",
        );

        const response = await handleMultisigKeyDecryptedMessage({
          multisigKeyEncryptedMessage:
            state.locallyEncryptedSharesByPreviousOwner.backup,
          multisigKey: previousOwner,
          results,
          index: 0,
        });
        return BackupShare.parse(JSON.parse(response));
      }

      setBackupShare(await getBackupShare());
      await nextHash.refetch();
      setResults(undefined);
      setProposedUpdate(true);
    },
    onError(error) {
      console.error(error);
    },
  });

  function getMultisigKeyEncryptedMessages(): string[] {
    if (!proposedUpdate && state.locallyEncryptedSharesByPreviousOwner) {
      return [state.locallyEncryptedSharesByPreviousOwner.backup];
    }

    return [];
  }

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
            memo=""
            rawData={`
Changes:
                
${diffString(previousOwner.toJSON(), newOwner.toJSON())}
              
Proposed Owner:
                
${JSON.stringify(newOwner.toJSON(), null, 2)}

Current Owner:
                
${JSON.stringify(previousOwner.toJSON(), null, 2)}
              `}
          />

          {nextHash.data ? (
            <ApproveIntentions
              key={`${proposedUpdate}-${nextHash.data}`}
              multisigKey={proposedUpdate ? newOwner : previousOwner}
              keyMetaData={keyMetaData}
              intentions={{
                signHashes: [nextHash.data],
                decryptMessages: [],
                decryptMultisigKeyEncryptedMessages:
                  getMultisigKeyEncryptedMessages(),
              }}
              onApprove={(results) => {
                setResults(results);
              }}
            />
          ) : null}

          <div className="mt-6 flex w-full flex-row space-x-6 ">
            <Button
              block
              variant="outline"
              onClick={() => {
                dispatch({ type: "reject-update-owner" });
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
