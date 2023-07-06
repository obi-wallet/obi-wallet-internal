import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import { ReactNode, useState } from "react";
import { FormattedMessage } from "react-intl";
import { View } from "react-native";

import {
  ConfirmMessages,
  ConfirmMessagesProps,
  ConfirmMessagesLogin,
} from "./confirm-messages";
import { Alert } from "../../../helpers";
import { KeysList, KeysListProps } from "../../multisig-settings";
import { Text } from "../../typography";

export interface MultisigConfirmMessagesProps
  extends Omit<
    ConfirmMessagesProps,
    "messages" | "loading" | "disabled" | "onConfirm"
  > {
  footer: ReactNode;
  threshold: number;
  numberOfUsableKeys: number;
  numberOfSignatures: number;
  innerMessages: ConfirmMessagesProps["messages"];
  safeSpendLimitExceeded?: boolean;
  data: KeysListProps["data"];
  onConfirm(): Promise<void>;
}

export const MultisigConfirmMessages = observer<MultisigConfirmMessagesProps>(
  function SignatureModal(MultisigConfirmMessagesProps) {
    const {
      onConfirm,
      numberOfSignatures,
      numberOfUsableKeys,
      threshold,
      data,
      safeSpendLimitExceeded,
      ...props
    } = MultisigConfirmMessagesProps;

    const theme = useTheme();
    const enoughSignatures = numberOfSignatures >= threshold;
    const [loading, setLoading] = useState(false);

    const renderBottomContent = () => {
      if (safeSpendLimitExceeded) {
        return (
          <View style={{ marginBottom: theme.spacing["16"] }}>
            <Text
              style={[
                theme.typography.body,
                {
                  textAlign: "center",
                  color: "#F6F5FF",
                  // fontSize: numberOfSignatures >= threshold ? 14 : 12,
                  fontWeight: theme.fontWeights.bold,
                  // opacity: numberOfSignatures >= threshold ? 1 : 0.6,
                  marginVertical: numberOfSignatures >= threshold ? 5 : 2,
                },
              ]}
            >
              Safe Spend Limit Exceeded
            </Text>
            <Text
              style={{
                textAlign: "center",
                color: "#F6F5FF",
                fontSize: numberOfSignatures >= threshold ? 14 : 12,
                fontWeight: "600",
                opacity: numberOfSignatures >= threshold ? 1 : 0.6,
                marginVertical: numberOfSignatures >= threshold ? 5 : 2,
              }}
            >
              Transaction requires {threshold}/{numberOfUsableKeys} signatures
            </Text>
          </View>
        );
      }

      return (
        <Text
          style={{
            textAlign: "center",
            color: "#F6F5FF",
            fontSize: numberOfSignatures >= threshold ? 14 : 12,
            fontWeight: "600",
            opacity: numberOfSignatures >= threshold ? 1 : 0.6,
            marginVertical: numberOfSignatures >= threshold ? 5 : 2,
          }}
        >
          <FormattedMessage
            id="signature.keysrequired"
            defaultMessage="Keys Required"
          />
          : {numberOfSignatures}/{threshold}
        </Text>
      );
    };

    return (
      <ConfirmMessages
        {...props}
        messages={props.innerMessages}
        loading={loading}
        disabled={!enoughSignatures}
        onConfirm={async () => {
          try {
            setLoading(true);
            await onConfirm();
            setLoading(false);
          } catch (e) {
            const error = e as Error;
            setLoading(false);
            console.error(error);
            Alert.alert("Error confirming signature", error.message);
          }
        }}
      >
        <KeysList
          data={data}
          tiled
          animate={!enoughSignatures}
          style={{
            marginVertical: 10,
            borderRadius: 12,
            alignItems: "center",
          }}
        />
        <View>{renderBottomContent()}</View>
      </ConfirmMessages>
    );
  }
);

export const MultisigLoginConfirmMessage =
  observer<MultisigConfirmMessagesProps>(function MultisigLoginConfirmMessage({
    onConfirm,
    numberOfSignatures,
    threshold,
    data,
    ...props
  }) {
    const getData = () =>
      data.map((item) => ({
        ...item,
        onPress: async () => {
          item.onPress && item.onPress();
          await onConfirm();
        },
      }));
    return (
      <ConfirmMessagesLogin
        {...props}
        messages={props.innerMessages}
        loading={false}
        disabled={false}
        onConfirm={async () => {
          try {
            await onConfirm();
          } catch (e) {
            const error = e as Error;
            console.error(error);
            Alert.alert("Error confirming signature", error.message);
          }
        }}
      >
        <Text
          style={{
            textAlign: "center",
            color: "#F6F5FF",
            fontSize: 14,
            fontWeight: "600",
            opacity: 1,
            marginVertical: 15,
          }}
        >
          <Text style={{ color: "white", opacity: 0.6, marginTop: 15 }}>
            Sign Once and Play (Keys Required {numberOfSignatures}/{threshold})
          </Text>
        </Text>
        <KeysList
          data={getData()}
          tiled
          animate={false}
          style={{
            marginVertical: 10,
            borderRadius: 12,
            alignItems: "center",
          }}
        />
      </ConfirmMessagesLogin>
    );
  });
