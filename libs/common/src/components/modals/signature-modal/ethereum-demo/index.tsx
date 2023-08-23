import {
  KeyType,
  SignAndBroadcastTransactionUserInteraction,
  Token,
} from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { useEffectOnceWhen } from "rooks";

import { useStore } from "../../../../contexts";

export type SignatureModalEthereumDemoProps = {
  interaction: SignAndBroadcastTransactionUserInteraction;
};

export const SignatureModalEthereumDemo =
  observer<SignatureModalEthereumDemoProps>(
    function SignatureModalEthereumDemo({ interaction }) {
      const { sdkRootStore } = useStore();

      const broadcast = useMutation({
        mutationFn: async () => {
          const message = interaction.payload.messages[0] as unknown as
            | {
                eth: { to: string; token: Token };
              }
            | {
                userop: {
                  contractAddress: string;
                  callData: string;
                  tokens: {
                    zepetoAccessToken: string;
                    zepetoRefreshToken: string;
                  };
                };
              };
          const wallet = sdkRootStore.walletsStore.currentWallet;
          const zAuthKey = wallet?.owner.getUsableKeyOfType(KeyType.ZAuth);

          async function handleMessage() {
            if (R.has("userop", message)) {
              return await fetch("/api/send-userop", {
                method: "POST",
                body: JSON.stringify({
                  chainId: wallet?.chainId,
                  publicKey: zAuthKey?.publicKey,
                  contractAddress: message.userop.contractAddress,
                  data: message.userop.callData,
                  tokens: message.userop.tokens,
                }),
              });
            }

            return await fetch("/api/ethereum-demo/send", {
              method: "POST",
              body: JSON.stringify({
                chainId: wallet?.chainId,
                publicKey: zAuthKey?.publicKey,
                to: message.eth.to,
                token: message.eth.token,
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
      }, interaction.payload.autoBroadcast);

      return null;
    },
  );
