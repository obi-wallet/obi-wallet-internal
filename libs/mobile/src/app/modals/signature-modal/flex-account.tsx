import { useTheme } from "@emotion/react";
import { Text } from "@obi-wallet/common";
import { FlexAccount, KeyType, MultisigWallet } from "@obi-wallet/sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { View } from "react-native";

import { AbstractSignatureModalProps } from "./common";
import { ConfirmMessages } from "./confirm-messages";
import { SignatureModalMultisigKey } from "./multisig-key";
import { createDeviceKeySigner } from "./signers";
import { KeysList } from "../../screens/components/keys-list";

export interface SignatureModalFlexAccountProps
  extends AbstractSignatureModalProps {
  wallet: MultisigWallet;
  flexAccount: FlexAccount;
}

export const SignatureModalFlexAccount =
  observer<SignatureModalFlexAccountProps>(function SignatureModalFlexAccount(
    props
  ) {
    const { interaction, flexAccount, wallet } = props;
    const { payload } = interaction;
    const innerMessages = payload.messages;

    const canExecute = useQuery({
      queryKey: ["can-execute"],
      queryFn: async () => {
        return wallet.canExecute({
          flexAccount,
          messages: innerMessages,
        });
      },
      cacheTime: 0,
    });

    if (canExecute.data === undefined) return null;

    if (canExecute.data) {
      return <SignatureModalFlexAccountWithFlexAccount {...props} />;
    } else {
      return (
        <SignatureModalMultisigKey
          {...props}
          multisigKey={wallet.owner}
          proxyAddress={wallet.proxyAddress}
          safeSpendLimitExceeded
        />
      );
    }
  });

export const SignatureModalFlexAccountWithFlexAccount =
  observer<SignatureModalFlexAccountProps>(
    function SignatureModalFlexAccountWithFlexAccount({
      interaction,
      wallet,
      flexAccount,
    }) {
      const multisigKey = wallet.owner;
      const theme = useTheme();
      const [signed, setSigned] = useState(false);

      const broadcast = useMutation({
        mutationFn: async () => {
          return await wallet.signAndBroadcastTransaction({
            flexAccount,
            messages: interaction.payload.messages,
          });
        },
      });

      const keysData = [
        {
          type: KeyType.Device,
          signed,
          right: null,
          onPress: async () => {
            const signer = await createDeviceKeySigner({ multisigKey });
            await signer.sign(new Buffer(""));
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
