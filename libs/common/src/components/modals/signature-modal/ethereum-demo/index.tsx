import { useTheme } from "@emotion/react";
import { useSignAndBroadcastTransaction } from "@obi-wallet/headless-ui";
import {
  SignAndBroadcastTransactionUserInteraction,
  Token,
} from "@obi-wallet/sdk";
import { useMutation } from "@tanstack/react-query";
import { MsgSend } from "@terra-money/feather.js";
import BigNumber from "bignumber.js";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { View } from "react-native";

import { useStore } from "../../../../contexts";
import { Alert } from "../../../../helpers";
import { Text } from "../../../typography";
import { ConfirmMessages } from "../confirm-messages";
import {
  SignatureModalMultisigKey,
  SignatureModalMultisigKeyProps,
} from "../multisig-key";
import { useEffect } from "react";
import { useEffectOnceWhen } from "rooks";

export type SignatureModalEthereumDemoProps = {
  interaction: SignAndBroadcastTransactionUserInteraction;
};

export const SignatureModalEthereumDemo =
  observer<SignatureModalEthereumDemoProps>(
    function SignatureModalEthereumDemo({ interaction }) {
      const { sdkRootStore, walletsStore } = useStore();
      const { payload } = interaction;
      const walletMeta = R.has("walletMeta", payload)
        ? payload.walletMeta
        : null;
      const wallet = walletMeta
        ? walletsStore.getWalletByProxyAddress(walletMeta.walletId)
        : null;
      const theme = useTheme();

      const message = interaction.payload.messages[0] as unknown as {
        eth: { to: string; token: Token };
      };
      const messages = [
        new MsgSend("from", message.eth.to, {
          [message.eth.token.id]: message.eth.token.rawAmount,
        }),
      ];

      function handleSessionKey() {
        const sessionKey = wallet?.gatekeeperConfig.flexAccounts[0];
        const spendLimit = sessionKey?.spendLimit?.amount;

        if (sessionKey && spendLimit) {
          const ztxToken = "0x5CF29823CCFC73008fa53630d54A424AB82dE6F2";

          if (message.eth.token.id === ztxToken) {
            const factor = new BigNumber(10).pow(18);
            const spendLimitBN = new BigNumber(spendLimit).times(factor);
            const spentSoFar =
              localStorage.getItem(`session-key-spent-${sessionKey.address}`) ??
              "0";
            const spentSoFarBN = new BigNumber(spentSoFar);
            const remaining = spendLimitBN.minus(spentSoFarBN);
            return {
              isUsingSessionKey: true,
              hasSpendLimitExceeded: remaining.isLessThan(
                new BigNumber(message.eth.token.rawAmount)
              ),
              onSuccess() {
                const newSpentSoFar = spentSoFarBN.plus(
                  new BigNumber(message.eth.token.rawAmount)
                );
                localStorage.setItem(
                  `session-key-spent-${sessionKey.address}`,
                  newSpentSoFar.toString()
                );
              },
            };
          } else {
            return {
              isUsingSessionKey: true,
              hasSpendLimitExceeded: true,
              onSuccess() {
                // noop
              },
            };
          }
        } else {
          return {
            isUsingSessionKey: false,
            hasSpendLimitExceeded: false,
            onSuccess() {
              // noop
            },
          };
        }
      }

      const { isUsingSessionKey, hasSpendLimitExceeded, onSuccess } =
        handleSessionKey();

      const fakeInteraction = {
        ...interaction,
        payload: {
          ...interaction.payload,
          messages,
          walletMeta: {
            walletId: walletMeta?.walletId as string,
            currentAccount: null,
          },
        },
      };

      const fakePayload = useSignAndBroadcastTransaction({
        interaction: fakeInteraction,
        onError(error) {
          Alert.alert("Transaction failed", error.message, [
            {
              text: "Cancel",
              onPress: () => {
                interaction.resolve({ approved: false });
              },
            },
          ]);
        },
      }) as SignatureModalMultisigKeyProps;

      const broadcast = useMutation({
        mutationFn: async () => {
          const message = interaction.payload.messages[0] as unknown as {
            eth: { to: string; token: Token };
          };
          const account =
            await sdkRootStore.ethereumDemoStore.getEthereumAccount();
          const response = await fetch("/api/ethereum-demo/send", {
            method: "POST",
            body: JSON.stringify({
              account,
              to: message.eth.to,
              token: message.eth.token,
            }),
          });
          const event = await response.json();
          return {
            success: !!event.transactionHash,
            transactionHash: event.transactionHash,
            rawResult: JSON.stringify(event),
          };
        },
        onSuccess(payload) {
          onSuccess();
          interaction.resolve({
            approved: true,
            payload,
          });
        },
        retry: 2,
      });

      useEffectOnceWhen(
        broadcast.mutate,
        interaction.payload.autoBroadcast &&
          isUsingSessionKey &&
          !hasSpendLimitExceeded
      );

      const cancel = () => {
        interaction.resolve({ approved: false });
      };

      if (isUsingSessionKey) {
        if (hasSpendLimitExceeded) {
          return (
            <SignatureModalMultisigKey
              {...fakePayload}
              interaction={interaction}
              messages={messages}
              cancel={cancel}
              broadcast={broadcast}
              safeSpendLimitExceeded
            />
          );
        } else {
          return (
            <ConfirmMessages
              loading={broadcast.isLoading}
              cancelable={interaction.payload.cancelable}
              messages={messages}
              chainId="osmo-test-5"
              onCancel={() => {
                interaction.resolve({ approved: false });
              }}
              onConfirm={broadcast.mutateAsync}
            >
              <View style={{ marginBottom: theme.spacing["16"] }}>
                {/*<Text*/}
                {/*  style={[*/}
                {/*    theme.typography.body,*/}
                {/*    {*/}
                {/*      textAlign: "center",*/}
                {/*      color: "#F6F5FF",*/}
                {/*      fontWeight: theme.fontWeights.bold,*/}
                {/*    },*/}
                {/*  ]}*/}
                {/*>*/}
                {/*  Device Key to Confirm*/}
                {/*</Text>*/}
                <Text
                  style={[
                    theme.typography.caption1,
                    {
                      textAlign: "center",
                      color: "#F6F5FF",
                    },
                  ]}
                >
                  Transaction can be executed by your session key
                </Text>
              </View>
            </ConfirmMessages>
          );
        }
      } else {
        return (
          <SignatureModalMultisigKey
            {...fakePayload}
            interaction={interaction}
            messages={messages}
            cancel={cancel}
            broadcast={broadcast}
          />
        );
      }
    }
  );
