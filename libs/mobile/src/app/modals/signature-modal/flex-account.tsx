import { useTheme } from "@emotion/react";
import {
  KeyType,
  MultisigKey,
  terra,
  Text,
  withLcdClient,
} from "@obi-wallet/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Msg, RawKey } from "@terra-money/terra.js";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { View } from "react-native";

import {
  AbstractSignatureModalProps,
  broadcastTransaction,
  wrapMessages,
} from "./common";
import { ConfirmMessages } from "./confirm-messages";
import { SignatureModalMultisigKey } from "./multisig-key";
import { BiometricsKey } from "./terra/keys";
import { KeysList } from "../../screens/components/keys-list";

export interface SignatureModalFlexAccountProps
  extends AbstractSignatureModalProps {
  flexAccount: RawKey;
  multisigKey: MultisigKey;
  proxyAddress: string;
}

export const SignatureModalFlexAccount =
  observer<SignatureModalFlexAccountProps>(function SignatureModalFlexAccount(
    props
  ) {
    const { data, flexAccount, proxyAddress } = props;
    const innerMessages = data.messages.map((data) => {
      return Msg.fromAmino(data);
    });
    const sender = flexAccount.accAddress;
    const wrappedMessages = wrapMessages({
      messages: innerMessages,
      proxyAddress,
      sender,
    });

    const canExecute = useQuery({
      queryKey: ["can-execute"],
      queryFn: async () => {
        return await withLcdClient(data.chain, async (client) => {
          const mayExecute = await Promise.all(
            innerMessages.map(async (message) => {
              try {
                const response = await client.wasm.contractQuery<{
                  can_execute: { yes?: string };
                }>(proxyAddress, {
                  can_execute: {
                    funds: [],
                    address: flexAccount.accAddress,
                    msg: { legacy: terra.wrapMessage(message) },
                  },
                });
                return !!response.can_execute.yes;
              } catch (e) {
                console.log(e);
                return false;
              }
            })
          );
          return mayExecute.every((mayExecute) => mayExecute) ? "yes" : "no";
        });
      },
      cacheTime: 0,
    });

    if (canExecute.data === "yes") {
      return (
        <SignatureModalFlexAccountWithFlexAccount
          {...props}
          wrappedMessages={wrappedMessages}
        />
      );
    }

    if (canExecute.data === "no") {
      return <SignatureModalMultisigKey {...props} safeSpendLimitExceeded />;
    }

    return null;
  });

export interface SignatureModalFlexAccountWithFlexAccountProps
  extends SignatureModalFlexAccountProps {
  wrappedMessages: Msg[];
}

export const SignatureModalFlexAccountWithFlexAccount =
  observer<SignatureModalFlexAccountWithFlexAccountProps>(
    function SignatureModalFlexAccountWithFlexAccount({
      data,
      flexAccount,
      multisigKey,
      wrappedMessages,
      onCancel,
      onConfirm,
    }) {
      const theme = useTheme();
      const queryClient = useQueryClient();
      const [signed, setSigned] = useState(false);

      const broadcast = useMutation({
        mutationFn: async () => {
          const transaction = await terra.createAndSignSinglesigTransaction({
            key: flexAccount,
            chainId: data.chain,
            messages: wrappedMessages,
          });
          return await broadcastTransaction({
            data,
            transaction,
            sender: flexAccount.accAddress,
          });
        },
      });

      const keysData = [
        {
          type: KeyType.Device,
          signed,
          right: null,
          onPress: async () => {
            const biometricsKey = new BiometricsKey({
              multisigKey,
              queryClient,
            });

            await biometricsKey.sign(new Buffer(""));

            setSigned(true);
          },
        },
      ];

      return (
        <ConfirmMessages
          loading={broadcast.isLoading}
          cancelable={data.cancelable}
          messages={data.messages}
          disabled={!signed}
          onCancel={onCancel}
          onConfirm={async () => {
            const response = await broadcast.mutateAsync();
            await onConfirm(response);
          }}
        >
          <KeysList
            data={keysData}
            tiled
            animate={!signed}
            style={{
              marginVertical: 10,
              backgroundColor: "transparent",
              borderRadius: 12,
              alignItems: "center",
            }}
          />
          <View style={{ marginBottom: theme.spacing["16"] }}>
            <Text
              style={[
                theme.typography.body,
                {
                  textAlign: "center",
                  color: "#F6F5FF",
                  fontWeight: theme.fontWeights.bold,
                },
              ]}
            >
              Device Key to Confirm
            </Text>
            <Text
              style={[
                theme.typography.caption1,
                {
                  textAlign: "center",
                  color: "#F6F5FF",
                },
              ]}
            >
              Transaction only requires one signature
            </Text>
          </View>
        </ConfirmMessages>
      );
    }
  );
