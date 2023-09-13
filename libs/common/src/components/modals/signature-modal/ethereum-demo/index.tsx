import {
  SignAndBroadcastTransactionUserInteraction,
  // Token,
} from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { Interface, InterfaceAbi, Signer, Wallet } from "ethers";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { useEffectOnceWhen } from "rooks";
import invariant from "tiny-invariant";
import { Client, IUserOperation, Presets } from "userop";

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

export class EthTransaction {
  abi: InterfaceAbi;
  contractAddress: string;
  functionName: string;
  params: unknown[];
  tokens: {
    accessToken: string;
    refreshToken: string;
  };

  constructor(input: EthTxInput) {
    this.abi = input.abi;
    this.contractAddress = input.contractAddress;
    this.functionName = input.functionName;
    this.params = input.params;
    this.tokens = input.tokens;
  }

  getEncodedCallData(): string {
    const contractInterface = new Interface(this.abi);

    // Ensure the function exists in the ABI
    if (!contractInterface.getFunction(this.functionName)) {
      throw new Error(
        `Function ${this.functionName} does not exist in the provided ABI.`,
      );
    }

    return contractInterface.encodeFunctionData(this.functionName, this.params);
  }
}

export const SignatureModalEthereumDemo =
  observer<SignatureModalEthereumDemoProps>(
    function SignatureModalEthereumDemo({ interaction }) {
      const { phoneSessionStore, /*sdkRootStore*/ } = useStore();
      const broadcast = useMutation({
        mutationFn: async () => {
          console.log("SignatureModalEthereumDemo()");
          console.log("interaction: " + JSON.stringify(interaction));
          const message = interaction.payload.messages[0] as /* unknown as
            | */ {
                eth: EthTxInput;
              };
            // | {
            //     userop: {
            //       contractAddress?: string;
            //       callData: string;
            //       tokens: {
            //         accessToken: string;
            //         refreshToken: string;
            //       };
            //     };
            //   };
          
          // zauth code disabled for now 
          /*
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
          } */

          async function handleMessage() {
            // should get this from api
            const paymasterUrl = "https://api.stackup.sh/v1/paymaster/ba320f6132714fa44989496f90aa8f059c55113322b22752ebf5a6bda111ac00";
            const paymasterMiddleware = Presets.Middleware.verifyingPaymaster(
              paymasterUrl,
              { type: "payg" },
            );
            
            const client = await Client.init(paymasterUrl);
            /*const signer = new SecretJsSigner(
              {
                chainId: body.homeChainId,
                zAuthKeyPair: homeChain.zAuthKeyPair,
                proxyAddress: homeChain.proxyAddress,
                targetChain: homeChain.targetChain,
              },
              homeChain.zAuthKeyPair,
            );*/

            // TODO: if session unavailable, re-request phone sign in
            invariant(phoneSessionStore.getKp?.privateKey, "no phone session key, sign in again");
            const signer: Signer = new Wallet(
              Buffer.from(phoneSessionStore.getKp.privateKey, "base64").toString("hex"),
            );
            const simpleAccount = await Presets.Builder.SimpleAccount.init(
              // @ts-expect-error this should be fine
              signer,
              paymasterUrl,
              { paymasterMiddleware },
            );
            
            const tx = new EthTransaction(message.eth);
            const data = tx.getEncodedCallData();
            async function buildUserOperation() {
              if (message.eth.contractAddress) {
                return await client.buildUserOperation(
                  simpleAccount.execute(tx.contractAddress, 0, data),
                );
              } else {
                /*
                return await client.buildUserOperation(
                  simpleAccount.setCallData(message.data),
                );
                */
                throw new Error("raw userop data not yet supported for phone key");
              }
            }
          
            async function handleUserOperation(userOperation: IUserOperation) {
              try {
                return await client.execUserOperation(userOperation);
              } catch (e) {
                const signature = userOperation.signature as string;
                userOperation.signature = `${signature.substring(
                  0,
                  userOperation.signature.length - 2,
                )}1b`;
                return await client.execUserOperation(userOperation);
              }
            }
          
            try {
              const builtUserOperation = await buildUserOperation();
              const userOperation = await handleUserOperation(builtUserOperation);
              const event = await userOperation.wait();
              console.log("event", event);
              return event;
            } catch (e) {
              console.log("error", e);
            }
            
            // only zauth key solo sign should call the api
            /*
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
            */
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
