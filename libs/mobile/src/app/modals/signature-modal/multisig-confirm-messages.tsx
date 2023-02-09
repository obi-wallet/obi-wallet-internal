import { Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { ReactNode, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Alert, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import { ConfirmMessages, ConfirmMessagesProps } from "./confirm-messages";
import { KeysList, KeysListProps } from "../../screens/components/keys-list";
import { useStore } from "../../stores";

export interface MultisigConfirmMessagesProps
  extends Omit<
    ConfirmMessagesProps,
    "messages" | "loading" | "disabled" | "onConfirm"
  > {
  footer: ReactNode;
  threshold: number;
  numberOfSignatures: number;
  innerMessages: ConfirmMessagesProps["messages"];
  data: KeysListProps["data"];

  onConfirm(): Promise<void>;
}

export const MultisigConfirmMessages = observer<MultisigConfirmMessagesProps>(
  function SignatureModal({
    onConfirm,
    numberOfSignatures,
    threshold,
    data,
    ...props
  }) {
    const { configStore } = useStore();
    const isObi = configStore.isObi();
    const isLoop = configStore.isLoop();
    const enoughSignatures = numberOfSignatures >= threshold;

    const [loading, setLoading] = useState(false);

    const getSignaturePercentage = () => {
      const percentage = (numberOfSignatures / threshold) * 100;
      if (percentage > 100) return "100%";
      return `${percentage}%`;
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
        {isLoop && (
          <View
            style={{
              height: 10,
              backgroundColor: "#1E1D3A",
              borderRadius: 10,
            }}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={["#FCCFF7", "#E659D6", "#8877EA", "#86E2EE"]}
              style={{
                flex: 1,
                width: getSignaturePercentage(),
                borderRadius: 10,
              }}
            />
          </View>
        )}
        {isLoop && (
          <View>
            <Text
              style={{
                textAlign: "center",
                color: "#F6F5FF",
                fontSize: 12,
                fontWeight: "600",
                opacity: 0.6,
                marginTop: 5,
              }}
            >
              <FormattedMessage
                id="signature.keysrequired"
                defaultMessage="Keys Required"
              />
              : {numberOfSignatures}/{threshold}
            </Text>
          </View>
        )}
        <KeysList
          data={data}
          tiled
          animate={!enoughSignatures}
          style={{
            marginVertical: 10,
            backgroundColor: isObi ? "transparent" : "#130F23",
            borderRadius: 12,
            alignItems: "center",
          }}
        />
        {isObi && (
          <View>
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
          </View>
        )}
      </ConfirmMessages>
    );
  }
);
