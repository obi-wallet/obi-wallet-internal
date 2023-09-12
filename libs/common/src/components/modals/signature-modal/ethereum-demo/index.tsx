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
import { UsableKey } from "libs/sdk/src/data-structures/key/implementation";

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
          let kp: any;
          const zAuthKey = wallet?.owner.getUsableKeyOfType(KeyType.ZAuth);
          if (!zAuthKey) {
            let [deviceKeyPair, _] = await getOrCreateDeviceKeyPair(false, false);
            kp = {
              type: KeyType.Device,
              payload: {
                publicKey: {
                  value: deviceKeyPair.publicKey,
                  type: "tendermint/PubKeySecp256k1"
                }
              }
            }
            console.log("using device key");
          } else {
            kp = zAuthKey;
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
                  publicKey: kp?.publicKey,
                  contractAddress: message.userop.contractAddress,
                  data: message.userop.callData,
                  tokens: message.userop.tokens,
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
                publicKey: kp?.publicKey,
                contractAddress: message.eth.contractAddress,
                data: encodeCallData(message.eth),
                tokens: message.eth.tokens,
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
