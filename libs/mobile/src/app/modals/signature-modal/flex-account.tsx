import { useTheme } from "@emotion/react";
import { KeysList, Text } from "@obi-wallet/common";
import {
  SignAndBroadcastTransactionType,
  useSignAndBroadcastTransaction,
} from "@obi-wallet/headless-ui";
import { KeyType } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { View } from "react-native";

import { ConfirmMessages } from "./confirm-messages";
import { createDeviceKeySigner } from "./signers";

export type SignatureModalFlexAccountProps = ReturnType<
  typeof useSignAndBroadcastTransaction
> & {
  type: SignAndBroadcastTransactionType.FlexAccount;
};

export const SignatureModalFlexAccount =
  observer<SignatureModalFlexAccountProps>(function SignatureModalFlexAccount({
    interaction,
    messages,
    cancel,
    broadcast,
    wallet,
  }) {
    const multisigKey = wallet?.owner;
    const theme = useTheme();
    const [signed, setSigned] = useState(false);

    const keysData = [
      {
        type: KeyType.Device,
        signed,
        right: null,
        onPress: async () => {
          if (!multisigKey) return;
          const signer = await createDeviceKeySigner({ multisigKey });
          await signer.sign(new Buffer(""));
          setSigned(true);
        },
      },
    ];

    return (
      <ConfirmMessages
        loading={broadcast.isLoading}
        cancelable={interaction.payload.cancelable}
        messages={messages}
        chainId={multisigKey.chainId}
        disabled={!signed}
        onCancel={cancel}
        onConfirm={broadcast.mutateAsync}
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
  });
