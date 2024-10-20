import { Button, Text, Transaction } from "@/components";
import { useStore } from "@/contexts";
import { IntentionsPayload } from "@/keys/intentions-handler";
import { TargetChain } from "@/target-chain";
import { SolanaChainId } from "@/target-chain/solana/chains";
import {
  ApproveIntentions,
  handleMultisigKeyDecryptedMessages,
  IntentionsResults,
} from "@/user-interactions/approve-intentions";
import { SendingAnimation } from "@/user-interactions/approve-messages/sending-animation";
import { SvmSendMessage } from "@/user-interactions/sign-and-broadcast/svm/user-interaction";
import { Base58EncodedString } from "@obi-wallet/encoding";
import { useQuery } from "@obi-wallet/headless-ui";
import { parseCaip19AssetId } from "@obi-wallet/sdk-caip";
import { Ed25519KeyPair } from "@obi-wallet/sdk-ed25519";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
} from "@solana/spl-token";
import {
  PublicKey,
  SystemProgram,
  Transaction as SolanaTransaction,
} from "@solana/web3.js";
import { skipToken, useMutation } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import invariant from "tiny-invariant";

export interface ApproveSvmTransactionProps {
  walletMeta: {
    userEntryAddress: string;
  };
  targetChainId: SolanaChainId;
  message: SvmSendMessage;
  onReject(): void;
  onApprove(args: {
    keyPair: Ed25519KeyPair;
    transaction: {
      message: Buffer;
      feeInfo: {
        amount: string;
        denom: string;
      }[];
    };
  }): Promise<void>;
}

export const ApproveSvmTransaction = observer<ApproveSvmTransactionProps>(
  function ApproveSvmTransaction({
    walletMeta,
    targetChainId,
    message,
    onApprove,
    onReject,
  }) {
    const { keyMetaDataStore, mpcWalletsStore } = useStore();
    const wallet = mpcWalletsStore.getWalletByUserEntryAddress(
      walletMeta.userEntryAddress,
    );
    const [intentionsResults, setIntentionsResults] = useState<
      IntentionsResults | undefined
    >();

    const targetChain = TargetChain.chainId(targetChainId);

    const transactionInfo = useQuery({
      queryKey: ["transaction", { message, targetChainId }],
      queryFn: wallet
        ? async () => {
            const getTransaction = async () => {
              if (message.id === targetChain.nativeCaip19AssetId) {
                const transferInstruction = SystemProgram.transfer({
                  fromPubkey: new PublicKey(message.fromAddress),
                  toPubkey: new PublicKey(message.toAddress),
                  lamports: BigInt(message.rawAmount),
                });
                return new SolanaTransaction().add(transferInstruction);
              } else {
                const { reference } = parseCaip19AssetId(message.id);
                const mint = new PublicKey(reference);

                const programIds =
                  await targetChain.getTokenProgramIds(reference);
                invariant(programIds, "Unknown token program");

                const { tokenProgramId, associatedTokenProgramId } = programIds;

                const from = new PublicKey(message.fromAddress);
                const to = new PublicKey(message.toAddress);
                const [fromTokenAccountAddress] =
                  PublicKey.findProgramAddressSync(
                    [
                      from.toBuffer(),
                      tokenProgramId.toBuffer(),
                      mint.toBuffer(),
                    ],
                    associatedTokenProgramId,
                  );
                const [toTokenAccountAddress] =
                  PublicKey.findProgramAddressSync(
                    [to.toBuffer(), tokenProgramId.toBuffer(), mint.toBuffer()],
                    associatedTokenProgramId,
                  );

                const transferInstruction = createTransferInstruction(
                  fromTokenAccountAddress,
                  toTokenAccountAddress,
                  from,
                  BigInt(message.rawAmount),
                  [],
                  tokenProgramId,
                );
                return new SolanaTransaction().add(
                  createAssociatedTokenAccountIdempotentInstruction(
                    from,
                    toTokenAccountAddress,
                    to,
                    mint,
                    tokenProgramId,
                    associatedTokenProgramId,
                  ),
                  transferInstruction,
                );
              }
            };

            const transaction = await getTransaction();

            const latestBlockHash =
              await targetChain.solanaConnection.getLatestBlockhash();
            transaction.recentBlockhash = latestBlockHash.blockhash;
            transaction.feePayer = new PublicKey(message.fromAddress);
            const amount = await transaction.getEstimatedFee(
              targetChain.solanaConnection,
            );

            const assetInfo = await targetChain.assetInfo(
              targetChain.nativeCaip19AssetId,
            );

            return {
              message: transaction.serializeMessage(),
              feeInfo:
                typeof amount === "number" && assetInfo
                  ? [
                      {
                        amount: new BigNumber(amount)
                          .dividedBy(10 ** assetInfo.decimals)
                          .toString(),
                        denom: "SOL",
                      },
                    ]
                  : [],
            };
          }
        : skipToken,
    });

    const feeInfo = transactionInfo.data?.feeInfo ?? [
      {
        amount: "",
        denom: "Simulating…",
      },
    ];

    const approve = useMutation({
      mutationFn: async () => {
        invariant(wallet, "Wallet not found");
        invariant(wallet.ed25519PublicKey, "Public key not found");
        invariant(intentionsPayload, "Intentions payload not found");
        invariant(intentionsResults, "Intentions results not found");
        invariant(transactionInfo.data, "Transaction info not found");

        const [privateKey] = await handleMultisigKeyDecryptedMessages({
          multisigKeyEncryptedMessages:
            intentionsPayload.decryptMultisigKeyEncryptedMessages,
          multisigKey: wallet.owner,
          results: intentionsResults,
        });

        await onApprove({
          keyPair: {
            publicKey: {
              type: "tendermint/PubKeyEd25519",
              value: wallet.ed25519PublicKey,
            },
            privateKey: Base58EncodedString.parse(privateKey),
          },
          transaction: transactionInfo.data,
        });
      },
      onError: (error) => {
        console.error(error);
      },
    });

    if (!wallet) return null;

    const keyMetaData = keyMetaDataStore.getKeyMetaData(
      wallet.userEntryAddress,
    );
    const intentionsPayload: IntentionsPayload | null = {
      signHashes: [],
      decryptEasyShare: null,
      decryptMessages: [],
      decryptPrimaryKeyEncryptedMessages: [],
      decryptMultisigKeyEncryptedMessages: wallet.encryptedEd25519PrivateKey
        ? [wallet.encryptedEd25519PrivateKey]
        : [],
    };

    return (
      <div className="mb-5 flex max-h-[calc(100vh_-_80px)] w-full justify-center overflow-auto">
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
            message={message}
            targetChainId={targetChainId}
            feeInfo={feeInfo}
          />

          {intentionsPayload ? (
            <ApproveIntentions
              multisigKey={wallet.owner}
              keyMetaData={keyMetaData}
              intentions={intentionsPayload}
              onApprove={(results) => {
                setIntentionsResults(results);
              }}
            />
          ) : null}

          <div className="mt-6 flex w-full flex-row space-x-6">
            <Button block variant="outline" onClick={onReject}>
              Reject
            </Button>
            <Button
              block
              disabled={approve.isPending || !intentionsResults}
              onClick={() => {
                approve.mutate();
              }}
            >
              Approve
            </Button>
          </div>
        </div>

        {approve.isPending && <SendingAnimation />}
      </div>
    );
  },
);
//
const PrettyPrint = observer(function PrettyPrint({
  message,
  targetChainId,
  feeInfo,
}: {
  message: SvmSendMessage;
  targetChainId: SolanaChainId;
  feeInfo: { amount: string; denom: string }[];
}) {
  const targetChain = TargetChain.chainId(targetChainId);

  const assetInfoQuery = useQuery({
    queryKey: ["assetInfo", { assetId: message.id, targetChainId }],
    queryFn: async () => {
      return await targetChain.assetInfo(message.id);
    },
  });

  if (!assetInfoQuery.data) return null;

  const asset = assetInfoQuery.data;

  const amount = new BigNumber(message.rawAmount)
    .dividedBy(10 ** (asset?.decimals ?? 0))
    .toString();

  return (
    <Transaction
      amountInfo={[
        {
          denom: asset?.symbol ?? message.id,
          amount,
        },
      ]}
      feeInfo={feeInfo}
      descriptions={[]}
      addresses={[message.toAddress]}
      memo=""
      targetChainId={targetChainId}
      rawData={message}
    />
  );
});
