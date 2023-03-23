import { useTheme } from "@emotion/react";
import { terra, Text } from "@obi-wallet/common";
import {
  Chain,
  KeyType,
  MultisigKey,
  Sdk,
  Signer,
  TerraChain,
  withTerraClient,
} from "@obi-wallet/sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Msg } from "@terra-money/feather.js";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { View } from "react-native";

import { AbstractSignatureModalProps, wrapMessages } from "./common";
import { ConfirmMessages } from "./confirm-messages";
import { SignatureModalMultisigKey } from "./multisig-key";
import { BiometricsKey } from "./terra/keys";
import { KeysList } from "../../screens/components/keys-list";

export interface SignatureModalFlexAccountProps
  extends AbstractSignatureModalProps {
  chainId: Chain;
  flexAccount: Signer;
  multisigKey: MultisigKey;
  proxyAddress: string;
}

export const SignatureModalFlexAccount =
  observer<SignatureModalFlexAccountProps>(function SignatureModalFlexAccount(
    props
  ) {
    const { interaction, chainId, flexAccount, proxyAddress } = props;
    const { payload } = interaction;
    const innerMessages = payload.messages;
    const flexAccountAddress = Sdk.chainId(chainId).getAddressOfSigner({
      signer: flexAccount,
    });
    const wrappedMessages = wrapMessages({
      messages: innerMessages,
      proxyAddress,
      sender: flexAccountAddress,
    });

    const canExecute = useQuery({
      queryKey: ["can-execute"],
      queryFn: async () => {
        // TODO:
        return await withTerraClient(chainId as TerraChain, async (client) => {
          const mayExecute = await Promise.all(
            innerMessages.map(async (message) => {
              try {
                const response = await client.wasm.contractQuery<{
                  can_execute: { yes?: string };
                }>(proxyAddress, {
                  can_execute: {
                    funds: [],
                    address: flexAccountAddress,
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
      chainId,
      interaction,
      flexAccount,
      multisigKey,
      wrappedMessages,
    }) {
      const theme = useTheme();
      const queryClient = useQueryClient();
      const [signed, setSigned] = useState(false);

      const broadcast = useMutation({
        mutationFn: async () => {
          const sdk = Sdk.chainId(chainId);
          await sdk.prepareSigner({ signer: flexAccount });
          const signedTransaction = await sdk.createAndSignTransaction({
            signer: flexAccount,
            messages: wrappedMessages,
          });
          return await sdk.broadcastSignedTransactionAndLendFees({
            signedTransaction,
            sender: sdk.getAddressOfSigner({ signer: flexAccount }),
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

      const { payload } = interaction;

      return (
        <ConfirmMessages
          loading={broadcast.isLoading}
          cancelable={payload.cancelable}
          messages={payload.messages}
          disabled={!signed}
          onCancel={() => {
            interaction.resolve({ approved: false });
          }}
          onConfirm={async () => {
            const response = await broadcast.mutateAsync();
            interaction.resolve({ approved: true, payload: response });
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
