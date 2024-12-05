import { Button, Text, Transaction } from "@/components";
import { EffectStateDispatch } from "@/effect/effect-state";
import { HomeChain } from "@/home-chain";
import { AsyncButton } from "@/ui/button";
import { ApproveIntentions } from "@/user-interactions/approve-intentions";
import {
  handleMultisigKeyDecryptedMessages,
  IntentionsResults,
} from "@/user-interactions/approve-intentions/utils";
import { SendingAnimation } from "@/user-interactions/approve-messages/sending-animation";
import {
  UpdateOwnerState,
  WalletDataFlowState,
} from "@/wallet-data-flow/state";
import {
  Base58EncodedString,
  Encoding,
  HexEncodedString,
} from "@obi-wallet/encoding";
import { useQuery } from "@obi-wallet/headless-ui";
import {
  BackupShare,
  EasyShare,
  MultisigKeyEncryptedData,
  SecretJsClient,
} from "@obi-wallet/sdk";
import { Ed25519KeyPair } from "@obi-wallet/sdk-ed25519";
import { deserialize, serialize } from "@obi-wallet/sdk-json";
import { skipToken, useMutation } from "@tanstack/react-query";
import { diffString } from "json-diff";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";

export interface UpdateOwnerProps {
  state: UpdateOwnerState;
  dispatch: EffectStateDispatch<typeof WalletDataFlowState>;
}

export const UpdateOwner = observer<UpdateOwnerProps>(function UpdateOwner({
  state,
  dispatch,
}) {
  const userEntryAddress = state.walletData.userEntryAddress;

  const previousOwner = state.previous.owner;
  const nextOwner = state.next.owner;

  const [proposedUpdate, setProposedUpdate] = useState(false);
  const keyMetaData = proposedUpdate
    ? state.next.keyMetaData
    : state.previous.keyMetaData;

  const [results, setResults] = useState<IntentionsResults | undefined>(
    undefined,
  );
  const [decrypted, setDecrypted] = useState<
    | {
        easyShare: EasyShare;
        backupShare: BackupShare;
        ed25519KeyPair: Ed25519KeyPair;
      }
    | undefined
  >(undefined);

  const userAccount = useQuery({
    queryKey: ["user-account", { walletData: state.walletData }],
    queryFn: async () => {
      const homeChain = HomeChain.chainId(nextOwner.chainId);
      const userEntryCodeHash =
        await homeChain.userEntryCodeHash(userEntryAddress);
      return await homeChain.userAccount({
        userEntryAddress,
        userEntryCodeHash,
      });
    },
  });

  const nextHash = useQuery({
    queryKey: ["next-hash", { walletData: state.walletData }],
    queryFn: userAccount.data
      ? async () => {
          const client = new SecretJsClient(nextOwner.chainId);
          const { next_hash } = await client.queryContract({
            contract: userAccount.data.userAccountAddress,
            codeHash: userAccount.data.userAccountCodeHash,
            query: {
              next_hash: {},
            },
            schema: z.object({
              next_hash: HexEncodedString,
            }),
          });
          return next_hash;
        }
      : skipToken,
    staleTime: 0,
  });

  const approve = useMutation({
    mutationFn: async () => {
      async function getProposeOwnerResponse() {
        invariant(userAccount.data, "Message not found");
        invariant(results, "Results not found");

        return await fetch("/api/propose-update-owner", {
          method: "POST",
          body: serialize({
            homeChainId: nextOwner.chainId,
            newOwner: nextOwner.toJSON(),
            userAccountAddress: userAccount.data.userAccountAddress,
            userAccountCodeHash: userAccount.data.userAccountCodeHash,
            signatures: [...results.values()].map((value) => {
              return Encoding.fromBytes(value.signedHashes[0]!).toHex();
            }),
          }),
        });
      }

      if (proposedUpdate) {
        invariant(userAccount.data, "Message not found");
        invariant(results, "Results not found");
        invariant(decrypted, "Decrypted not found");

        await dispatch(
          state.confirmOwner({
            userAccountAddress: userAccount.data.userAccountAddress,
            userAccountCodeHash: userAccount.data.userAccountCodeHash,
            easyShare: decrypted.easyShare,
            backupShare: decrypted.backupShare,
            ed25519KeyPair: decrypted.ed25519KeyPair,
            results: results,
          }),
        );
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

      invariant(results, "Results not found");

      const [easyShareRaw, backupShareRaw, ed25519PrivateKeyRaw] =
        await handleMultisigKeyDecryptedMessages({
          multisigKeyEncryptedMessages: getMultisigKeyEncryptedMessages(),
          multisigKey: previousOwner,
          results,
        });

      invariant(easyShareRaw, "Easy share not found");
      invariant(backupShareRaw, "Backup share not found");
      invariant(ed25519PrivateKeyRaw, "Ed25519 private key not found");

      const easyShare = EasyShare.parse(deserialize(easyShareRaw));
      const backupShare = BackupShare.parse(deserialize(backupShareRaw));
      const ed25519KeyPair: Ed25519KeyPair = {
        publicKey: {
          type: "tendermint/PubKeyEd25519",
          value: state.walletData.ed25519KeyPair.publicKey,
        },
        privateKey: Base58EncodedString.parse(ed25519PrivateKeyRaw),
      };

      setDecrypted({
        easyShare,
        backupShare,
        ed25519KeyPair,
      });
      await nextHash.refetch();
      setResults(undefined);
      setProposedUpdate(true);
    },
    onError(error) {
      console.error(error);
    },
  });

  function getMultisigKeyEncryptedMessages(): MultisigKeyEncryptedData[] {
    if (!proposedUpdate) {
      return [
        state.walletData.encryptedShares.easy,
        state.walletData.encryptedShares.backup,
        state.walletData.ed25519KeyPair.encryptedPrivateKey,
      ];
    }

    return [];
  }

  return (
    <div className="relative w-full md:mt-24">
      <div className="flex justify-center">
        <div className="flex w-fit flex-col items-center">
          <Text
            leading="loose"
            size="3xl"
            fontWeight="bold"
            className="mb-8 mt-4"
          >
            {proposedUpdate ? "Step 2 of 2" : "Step 1 of 2"}
          </Text>

          <Transaction
            amountInfo={[]}
            feeInfo={[]}
            descriptions={[
              proposedUpdate
                ? `Confirm new key schema`
                : `Propose new key schema`,
            ]}
            memo=""
            rawData={`Changes:\n\n${diffString(previousOwner.toJSON(), nextOwner.toJSON())}\n\nProposed Owner:\n\n${serialize(nextOwner.toJSON(), null, 2)}\n\nCurrent Owner:\n\n${serialize(previousOwner.toJSON(), null, 2)}
              `}
          />

          {nextHash.data ? (
            <ApproveIntentions
              key={`${proposedUpdate}-${nextHash.data.toString()}`}
              multisigKey={proposedUpdate ? nextOwner : previousOwner}
              keyMetaData={keyMetaData}
              intentions={{
                signHashes: [Encoding.fromHex(nextHash.data).toBytes()],
                decryptEasyShare: null,
                decryptMessages: [],
                decryptPrimaryKeyEncryptedMessages: [],
                decryptMultisigKeyEncryptedMessages:
                  getMultisigKeyEncryptedMessages(),
              }}
              onApprove={(results) => {
                setResults(results);
              }}
            />
          ) : null}

          <div className="mt-6 flex w-full flex-row space-x-6">
            <AsyncButton
              block
              variant="outline"
              onClick={async () => {
                await dispatch(state.cancel());
              }}
            >
              Reject
            </AsyncButton>
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
