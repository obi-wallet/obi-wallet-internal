import { Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { ReactNode, useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";

import { Loader } from "../../loader";
import { KeysList, KeysListProps } from "../../screens/components/keys-list";
import { useStore } from "../../stores";
import { ConfirmMessages, ConfirmMessagesProps } from "./confirm-messages";

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
    const intl = useIntl();
    const { configStore } = useStore();
    const [settingBiometrics, setSettingBiometrics] = useState(false);
    const isObi = configStore.isObi();
    const isLoop = configStore.isLoop();
    const enoughSignatures = numberOfSignatures >= threshold;

    const [loading, setLoading] = useState(false);

    const didAutosign = useRef(false);
    useEffect(() => {
      (async () => {
        if (props.visible && !didAutosign.current) {
          didAutosign.current = true;
          const biometrics = data.find((key) => key.id === "biometrics");
          if (biometrics && typeof biometrics.onPress === "function") {
            try {
              setSettingBiometrics(true);
              await biometrics.onPress();
            } catch (e) {
              // noop
            }
            setSettingBiometrics(false);
          }
        }
      })();
      // We really only want to do this once
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.visible]);

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
        {settingBiometrics ? (
          <View
            style={{
              marginVertical: 10,
              backgroundColor: isLoop ? "#130F23" : "",
              borderRadius: 12,
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: 50,
            }}
          >
            <Loader
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              loadingText={intl.formatMessage({
                id: "onboarding6.loadingtext",
                defaultMessage: "Preparing Wallet...",
              })}
            />
          </View>
        ) : (
          <KeysList
            data={data}
            tiled
            style={{
              marginVertical: 10,
              backgroundColor: isObi ? "transparent" : "#130F23",
              borderRadius: 12,
            }}
          />
        )}
        {isObi && (
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
      </ConfirmMessages>
    );
  }
);
