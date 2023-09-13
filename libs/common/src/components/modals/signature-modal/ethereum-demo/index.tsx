import {
  SignAndBroadcastTransactionUserInteraction,
  TargetChain,
  // Token,
} from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { Interface, InterfaceAbi } from "ethers";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { useEffectOnceWhen } from "rooks";
import invariant from "tiny-invariant";

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
      const { phoneSessionStore, sdkRootStore } = useStore();
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

          const wallet = sdkRootStore.walletsStore.currentWallet;

          async function handleMessage() {
            const phoneKp = phoneSessionStore.getKp;
            invariant(
              phoneKp?.privateKey,
              "no phone session key, sign in again",
            );
            const tx = new EthTransaction(message.eth);
            const data = tx.getEncodedCallData();
            return await fetch("/api/send-userop", {
              method: "POST",
              body: JSON.stringify({
                homeChainId: wallet?.chainId,
                targetChainId:
                  interaction.payload.targetChainId ??
                  TargetChain.ArbitrumOneGoerliTestnet,
                publicKey: phoneKp?.publicKey,
                contractAddress: message.eth.contractAddress,
                data: data,
                tokens: message.eth.tokens,
                deviceKeyPair: phoneKp,
              }),
            });
          }

          const response = await handleMessage();
          const event = await response.json();
          console.log("handling message");

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
