import {
  MultisigSigner,
  Sdk,
  SignAndBroadcastTransactionUserInteraction,
  Messages,
  ChainId,
  Message,
  BroadcastTransactionResult,
  SecretJsClient,
  secretJsChains,
} from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { sha256 } from "ethers";
import * as R from "ramda";
import { useEffectOnceWhen } from "rooks";
import invariant from "tiny-invariant";

import { useAwaitableState } from "./awaitable-state";
import { useRootStore } from "../provider";

export enum SignAndBroadcastTransactionType {
  FlexAccount = "flex-account",
  SinglesigWallet = "singlesig-wallet",
  MultisigKey = "multisig-key",
}

export function useSignAndBroadcastTransaction({
  interaction,
  onError,
}: {
  interaction: SignAndBroadcastTransactionUserInteraction;
  onError(error: Error): void;
}) {
  const { walletsStore } = useRootStore();
  const { payload } = interaction;

  const walletMeta = R.has("walletMeta", payload) ? payload.walletMeta : null;
  const wallet = walletMeta
    ? walletsStore.getWalletByProxyAddress(walletMeta.walletId)
    : null;
  const currentAccount = walletMeta?.currentAccount
    ? wallet?.getAccountByMeta(walletMeta.currentAccount)
    : null;
  const multisigKey = R.has("walletMeta", payload)
    ? wallet?.owner
    : payload.multisigKey;

  const awaitableCanExecute = useAwaitableState<boolean>();
  const canExecuteMutation = useMutation({
    mutationFn: async () => {
      if (wallet && currentAccount?.type === "flex-account") {
        return wallet.canExecute({
          flexAccount: currentAccount,
          messages: payload.messages,
        });
      }

      return false;
    },
    onSuccess(value) {
      awaitableCanExecute.set(value);
    },
    retry: 2,
  });

  const awaitableMultisigSigner = useAwaitableState<MultisigSigner>();
  const multisigSignerMutation = useMutation({
    mutationFn: async () => {
      if (!multisigKey || (await awaitableCanExecute.getAsync())) return null;
      /* eslint-disable @typescript-eslint/no-explicit-any */
      if ((payload.messages[0] as any).raw) {
        return await multisigKey.createSigner({
          messages: payload.messages,
        });
      } else {
        return await multisigKey.createSigner({
          messages: wrapMessages({
            messages: payload.messages,
            proxyAddress: wallet?.proxyAddress,
            sender: multisigKey?.address,
            chainId: multisigKey?.chainId,
          }),
        });
      }
    },
    onSuccess(value) {
      if (value) {
        awaitableMultisigSigner.set(value);
      }
    },
    onError(error) {
      onError(error as Error);
    },
    retry: 2,
  });

  useEffectOnceWhen(() => {
    canExecuteMutation.mutate();
    multisigSignerMutation.mutate();
  });

  const broadcast = useMutation({
    mutationFn: async () => {
      if (wallet) {
        if (
          currentAccount?.type === "flex-account" &&
          (await awaitableCanExecute.getAsync())
        ) {
          return await wallet.signAndBroadcastTransaction({
            flexAccount: currentAccount,
            messages: payload.messages,
          });
        }
        if (currentAccount?.type === "singlesig-wallet") {
          return await wallet.signAndBroadcastTransaction({
            singlesigWallet: currentAccount,
            messages: payload.messages,
          });
        }
      }

      invariant(multisigKey, "Expected multisigKey to exist.");
      const multisigSigner = await awaitableMultisigSigner.getAsync();
      const { signed, broadcast } =
        multisigSigner.createSignedTransactionOrMessage();
      if (broadcast) {
        return await Sdk.chainId(
          multisigKey.chainId,
        ).transactions.broadcastSignedTransactionAndLendFees({
          signedTransaction: signed[0],
          sender: multisigKey.address,
        });
      } else {
        const chain = secretJsChains["secret-4"];

        const signerSignature = await new SecretJsClient(
          "secret-4",
        ).withSecretNetworkClient(async (client) => {
          const user_entry_code_hash =
            await client.query.compute.codeHashByContractAddress({
              contract_address: wallet?.proxyAddress,
            });
          const sign_bytes_query_msg = {
            contract_address: chain.secretSigner.address,
            code_hash: chain.secretSigner.codeHash,
            query: {
              sign_bytes: {
                user_entry_address: wallet?.proxyAddress,
                user_entry_code_hash: user_entry_code_hash.code_hash!,
                bytes: sha256(Buffer.from((payload.messages[0] as any).raw)),
                bytes_signed_by_signers: signed.map((s) =>
                  Buffer.from(s).toString("hex"),
                ),
              },
            },
          };
          console.log(
            "sign_bytes_query_msg: " + JSON.stringify(sign_bytes_query_msg),
          );
          const response = (await client.query.compute.queryContract(
            sign_bytes_query_msg,
          )) as { signature: string };
          console.log("signer contract response: " + JSON.stringify(response));
          return response.signature;
        });
        console.log("signer contract signature: " + signerSignature);
        return {
          success: true,
          transactionHash: signerSignature,
          rawResult: undefined,
          rawLog: undefined,
        } as BroadcastTransactionResult;
      }
    },
    onSuccess(payload) {
      interaction.resolve({ approved: true, payload });
    },
    retry: 2,
  });

  const common = {
    interaction,
    messages: payload.messages,
    cancel() {
      interaction.resolve({ approved: false });
    },
    broadcast,
  };

  if (wallet) {
    if (currentAccount?.type === "flex-account") {
      if (canExecuteMutation.data === undefined) return null;

      if (canExecuteMutation.data) {
        return {
          ...common,
          type: SignAndBroadcastTransactionType.FlexAccount as const,
          wallet,
        };
      }

      return {
        ...common,
        type: SignAndBroadcastTransactionType.MultisigKey as const,
        multisigSigner: awaitableMultisigSigner,
        multisigKey: wallet.owner,
        safeSpendLimitExceeded: true,
        wallet,
      };
    }

    if (currentAccount?.type === "singlesig-wallet") {
      return {
        ...common,
        type: SignAndBroadcastTransactionType.SinglesigWallet as const,
        wallet,
      };
    }
  }

  invariant(multisigKey, "Expected multisigKey to exist.");
  return {
    ...common,
    type: SignAndBroadcastTransactionType.MultisigKey as const,
    multisigSigner: awaitableMultisigSigner,
    multisigKey,
    safeSpendLimitExceeded: false,
  };
}

function wrapMessages({
  messages,
  proxyAddress,
  sender,
  chainId,
}: {
  messages: Message[];
  proxyAddress?: string;
  sender?: string;
  chainId?: ChainId;
}): Message[] {
  if (!proxyAddress || !sender || !chainId) return messages;

  return Messages.chainId(chainId).wrapMessages({
    messages,
    sender,
    userEntryContract: proxyAddress,
  });
}
