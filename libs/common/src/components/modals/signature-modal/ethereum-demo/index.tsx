import {
  KeyType,
  SignAndBroadcastTransactionUserInteraction,
  TargetChain,
  getOrCreateDeviceKeyPair,
  // Token,
} from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { Interface, InterfaceAbi } from "ethers";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { useEffectOnceWhen } from "rooks";

import { useStore } from "../../../../contexts";

export type SignatureModalEthereumDemoProps = {
  interaction: SignAndBroadcastTransactionUserInteraction;
};

type EthTxInput = {
  abi: InterfaceAbi;
  contractAddress: string;
  functionName: string;
  params: unknown[];
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

function encodeCallData({ abi, functionName, params }: EthTxInput): string {
  const contractInterface = new Interface(abi);

  // Ensure the function exists in the ABI
  if (!contractInterface.getFunction(functionName)) {
    throw new Error(
      `Function ${functionName} does not exist in the provided ABI.`,
    );
  }

  return contractInterface.encodeFunctionData(functionName, params);
}

export const SignatureModalEthereumDemo =
  observer<SignatureModalEthereumDemoProps>(
    function SignatureModalEthereumDemo({ interaction }) {
      const { sdkRootStore } = useStore();
      const broadcast = useMutation({
        mutationFn: async () => {
          console.log("SignatureModalEthereumDemo()");
          console.log("interaction: " + JSON.stringify(interaction));
          const message = interaction.payload.messages[0] as unknown as
            | {
                eth: EthTxInput;
              }
            | {
                userop: {
                  contractAddress?: string;
                  callData: string;
                  tokens: {
                    accessToken: string;
                    refreshToken: string;
                  };
                };
              };
          const wallet = sdkRootStore.walletsStore.currentWallet;
          let kp: {
            type: KeyType;
            payload: {
              publicKey: {
                value: string;
                type: string;
              };
              privateKey: string;
            };
          };
          const zAuthKey = wallet?.owner.getUsableKeyOfType(KeyType.ZAuth);
          if (!zAuthKey) {
            const [deviceKeyPair, _] = await getOrCreateDeviceKeyPair(
              false,
              false,
            );
            kp = {
              type: KeyType.Device,
              payload: {
                publicKey: {
                  value: deviceKeyPair.publicKey.value,
                  type: "tendermint/PubKeySecp256k1",
                },
                privateKey: deviceKeyPair.privateKey,
              },
            };
          } else {
            kp = {
              type: KeyType.ZAuth,
              payload: {
                publicKey: {
                  value: zAuthKey.publicKey.value,
                  type: zAuthKey.publicKey.type,
                },
                privateKey: "",
              },
            };
            console.log("using zauthkey");
          }

          async function handleMessage() {
            if (R.has("userop", message)) {
              return await fetch("/api/send-userop", {
                method: "POST",
                body: JSON.stringify({
                  homeChainId: wallet?.chainId,
                  targetChainId:
                    interaction.payload.targetChainId ??
                    TargetChain.ArbitrumOneGoerliTestnet,
                  publicKey: kp?.payload.publicKey,
                  contractAddress: message.userop.contractAddress,
                  data: message.userop.callData,
                  tokens: message.userop.tokens,
                  deviceKeyPair: kp?.payload,
                }),
              });
            }

            return await fetch("/api/send-userop", {
              method: "POST",
              body: JSON.stringify({
                homeChainId: wallet?.chainId,
                targetChainId:
                  interaction.payload.targetChainId ??
                  TargetChain.ArbitrumOneGoerliTestnet,
                publicKey: kp?.payload.publicKey,
                contractAddress: message.eth.contractAddress,
                data: encodeCallData(message.eth),
                tokens: message.eth.tokens,
                deviceKeyPair: kp.payload,
              }),
            });
          }

          const response = await handleMessage();
          const event = await response.json();
          if (!R.has("transactionHash", event)) {
            throw new Error(JSON.stringify(event));
          }
          return {
            success: true,
            transactionHash: event.transactionHash as string,
            rawResult: JSON.stringify(event),
          };
        },
        onSuccess(payload) {
          if (!payload.success) {
            console.log(payload);
          }
          interaction.resolve({
            approved: true,
            payload,
          });
        },
        onError(error) {
          interaction.resolve({
            approved: true,
            payload: {
              success: false,
              transactionHash: "",
              rawResult: error,
            },
          });
        },
      });

      useEffectOnceWhen(() => {
        broadcast.mutate();
      }, true);

      return null;
    },
  );
