import { Button, Text, Transaction } from "@/components";
import { useStore } from "@/contexts";
import { IntentionsPayload } from "@/keys/intentions-handler";
import { TargetChain } from "@/target-chain";
import {
  deserializeUserOperation,
  SerializedEvmUserOperation,
} from "@/target-chain/eip-155";
import { Eip155ChainId } from "@/target-chain/eip-155/chains";
import {
  ApproveIntentions,
  IntentionsResults,
} from "@/user-interactions/approve-intentions";
import { SendingAnimation } from "@/user-interactions/approve-messages/sending-animation";
import { HexEncodedStringWithPrefix } from "@obi-wallet/encoding";
import { useQuery } from "@obi-wallet/headless-ui";
import { MpcWallet } from "@obi-wallet/sdk";
import { serialize } from "@obi-wallet/sdk-json";
import { skipToken, useMutation } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import invariant from "tiny-invariant";
import { decodeFunctionData, hexToBigInt, size, sliceHex } from "viem";
import { z } from "zod";

export interface ApproveEvmTransactionProps {
  walletMeta: {
    userEntryAddress: string;
  };
  targetChainId: Eip155ChainId;
  callData: HexEncodedStringWithPrefix;
  onReject(): void;
  onApprove(args: {
    wallet: MpcWallet;
    userOperation: SerializedEvmUserOperation;
    intentionsPayload: IntentionsPayload;
    intentionsResults: IntentionsResults;
  }): Promise<void>;
}

export const ApproveEvmTransaction = observer<ApproveEvmTransactionProps>(
  function ApproveEvmTransaction({
    walletMeta,
    targetChainId,
    callData,
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

    const userOperation = useQuery({
      queryKey: ["user-operation", { walletMeta, targetChainId, callData }],
      queryFn: wallet
        ? async () => {
            const response = await fetch(
              "/api/evm/prepare-user-operation-request",
              {
                method: "POST",
                body: serialize({
                  homeChainId: wallet.homeChainId,
                  targetChainId,
                  userEntryAddress: wallet.userEntryAddress,
                  callData,
                }),
              },
            );
            const schema = z.object({
              success: z.boolean(),
              userOperation: z.custom<SerializedEvmUserOperation>(() => {
                return true;
              }),
            });
            const { success, userOperation } = schema.parse(
              await response.json(),
            );
            if (!success) {
              throw new Error("Failed to prepare user operation request");
            }

            const hash = await targetChain.calculateHashToSign({
              wallet,
              userOperation: deserializeUserOperation(userOperation),
            });

            return {
              userOperation,
              hash: Buffer.from(hash).toString("hex"),
            };
          }
        : skipToken,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    });

    const approve = useMutation({
      mutationFn: async () => {
        invariant(wallet, "Wallet not found");
        invariant(userOperation.data, "userOperation could not be found");
        invariant(intentionsPayload, "Intentions payload not found");
        invariant(intentionsResults, "Intentions results not found");

        await onApprove({
          wallet,
          userOperation: userOperation.data.userOperation,
          intentionsResults,
          intentionsPayload,
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
    const intentionsPayload: IntentionsPayload | null = userOperation.data
      ? {
          signHashes: [
            new Uint8Array(Buffer.from(userOperation.data.hash, "hex")),
          ],
          decryptMessages: [],
          decryptMultisigKeyEncryptedMessages: [],
        }
      : null;

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
            callData={callData}
            targetChainId={targetChainId}
            userOperation={userOperation.data?.userOperation}
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

          <div className="mt-6 flex w-full flex-row space-x-6 ">
            <Button block variant="outline" onClick={onReject}>
              Reject
            </Button>
            <Button
              block
              disabled={
                !userOperation.isSuccess ||
                approve.isPending ||
                !intentionsResults
              }
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

const PrettyPrint = observer(function PrettyPrint({
  callData,
  targetChainId,
}: {
  callData: HexEncodedStringWithPrefix;
  userOperation?: SerializedEvmUserOperation;
  targetChainId: Eip155ChainId;
}) {
  // TODO: copy-pasted from permissionless
  const KernelV3ExecuteAbi = [
    {
      type: "function",
      name: "execute",
      inputs: [
        { name: "execMode", type: "bytes32", internalType: "ExecMode" },
        { name: "executionCalldata", type: "bytes", internalType: "bytes" },
      ],
      outputs: [],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "executeFromExecutor",
      inputs: [
        { name: "execMode", type: "bytes32", internalType: "ExecMode" },
        { name: "executionCalldata", type: "bytes", internalType: "bytes" },
      ],
      outputs: [
        { name: "returnData", type: "bytes[]", internalType: "bytes[]" },
      ],
      stateMutability: "payable",
    },
    {
      type: "function",
      name: "executeUserOp",
      inputs: [
        {
          name: "userOp",
          type: "tuple",
          internalType: "struct PackedUserOperation",
          components: [
            {
              name: "sender",
              type: "address",
              internalType: "address",
            },
            { name: "nonce", type: "uint256", internalType: "uint256" },
            { name: "initCode", type: "bytes", internalType: "bytes" },
            { name: "callData", type: "bytes", internalType: "bytes" },
            {
              name: "accountGasLimits",
              type: "bytes32",
              internalType: "bytes32",
            },
            {
              name: "preVerificationGas",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "gasFees",
              type: "bytes32",
              internalType: "bytes32",
            },
            {
              name: "paymasterAndData",
              type: "bytes",
              internalType: "bytes",
            },
            { name: "signature", type: "bytes", internalType: "bytes" },
          ],
        },
        { name: "userOpHash", type: "bytes32", internalType: "bytes32" },
      ],
      outputs: [],
      stateMutability: "payable",
    },
  ] as const;

  const functionData = decodeFunctionData({
    abi: KernelV3ExecuteAbi,
    data: callData,
  });

  if (functionData.functionName === "execute") {
    const [_execMode, executionCallData] = functionData.args;

    // First 20 bytes is the recipient
    const to = sliceHex(executionCallData, 0, 20);
    // Next 32 bytes is the value
    const value = sliceHex(executionCallData, 20, 52);
    // The rest is the data
    const data =
      size(executionCallData) > 52 ? sliceHex(executionCallData, 52) : null;

    const targetChain = TargetChain.chainId(targetChainId);
    const asset = targetChain.assetInfo(targetChain.nativeCurrency.symbol);
    const amount = new BigNumber(hexToBigInt(value).toString(10))
      .dividedBy(10 ** (asset?.decimals ?? 0))
      .toString();

    return (
      <Transaction
        amountInfo={[
          {
            denom: asset?.symbol ?? targetChain.nativeCurrency.symbol,
            amount,
          },
        ]}
        feeInfo={[]}
        descriptions={[]}
        addresses={[to]}
        memo=""
        targetChainId={targetChainId}
        rawData={data}
      />
    );
  }

  console.warn("Unknown function name", functionData.functionName);

  return null;
});
