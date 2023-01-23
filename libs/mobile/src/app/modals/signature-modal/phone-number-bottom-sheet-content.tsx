import { BottomSheetTextInput } from "@gorhom/bottom-sheet/src";
import { Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Alert, View } from "react-native";

import { InlineButton } from "../../button";
import {
  SecurityQuestionInput,
  useSecurityQuestionInput,
} from "../../screens/components/phone-number/security-question-input";
import { SendMagicSmsButton } from "../../screens/components/phone-number/send-magic-sms-button";
import { VerifyAndProceedButton } from "../../screens/components/phone-number/verify-and-proceed-button";
import { useStore } from "../../stores";
import { TextInput } from "../../text-input";

export interface PhoneNumberBottomSheetContentProps {
  securityQuestion: string;

  onRequest(securityAnswer: string): Promise<void>;

  onConfirm(key: string): Promise<void>;
}

export const PhoneNumberBottomSheetContent =
  observer<PhoneNumberBottomSheetContentProps>(
    ({ securityQuestion, onRequest, onConfirm }) => {
      const intl = useIntl();
      const { securityAnswer, setSecurityAnswer } = useSecurityQuestionInput();
      const { configStore } = useStore();
      const isLoop = configStore.isLoop();
      const [sentMessage, setSentMessage] = useState(false);
      const [key, setKey] = useState("");

      const [magicButtonDisabled, setMagicButtonDisabled] = useState(true); // Magic Button disabled by default
      const [
        magicButtonDisabledDoubleclick,
        setMagicButtonDisabledDoubleclick,
      ] = useState(false); // Magic Button disabled on button-click to prevent double-click

      const [verifyButtonDisabled, setVerifyButtonDisabled] = useState(true); // Magic Button disabled by default
      const [
        verifyButtonDisabledDoubleclick,
        setVerifyButtonDisabledDoubleclick,
      ] = useState(false); // Magic Button disable on button-click

      const minInputCharsSecurityAnswer = 3;
      const minInputCharsSMSCode = 8;

      useEffect(() => {
        if (securityAnswer.length >= minInputCharsSecurityAnswer) {
          setMagicButtonDisabled(false); // Enable Magic Button if checks are okay
        } else {
          setMagicButtonDisabled(true);
        }
      }, [magicButtonDisabled, setMagicButtonDisabled, securityAnswer]);

      useEffect(() => {
        if (key.length >= minInputCharsSMSCode) {
          setVerifyButtonDisabled(false); // Enable Magic Button if checks are okay
        } else {
          setVerifyButtonDisabled(true);
          setVerifyButtonDisabledDoubleclick(false);
        }
      }, [verifyButtonDisabled, setVerifyButtonDisabled, key]);

      if (sentMessage) {
        return (
          <View
            style={{
              flexGrow: 1,
              flex: 1,
              paddingHorizontal: 20,
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text
                style={{
                  color: isLoop ? "#999CB6" : "#fff",
                  fontSize: 14,
                  marginTop: 10,
                }}
              >
                <FormattedMessage
                  id="signature.pasteresponse"
                  defaultMessage="Paste in the response you received."
                />
              </Text>
              <TextInput
                placeholder={intl.formatMessage({
                  id: "signature.smscodelabel",
                  defaultMessage: "8-Digits SMS-Code",
                })}
                textContentType="oneTimeCode"
                keyboardType="number-pad"
                style={{ marginTop: 25 }}
                value={key}
                onChangeText={setKey}
                CustomTextInput={BottomSheetTextInput}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 24,
                }}
              >
                <Text
                  style={{ color: "rgba(246, 245, 255, 0.6)", fontSize: 12 }}
                >
                  <FormattedMessage
                    id="signature.noresponselabel"
                    defaultMessage="Didn't receive a response?"
                  />
                </Text>

                <InlineButton
                  label={intl.formatMessage({
                    id: "signature.sendagain",
                    defaultMessage: "Resend",
                  })}
                  onPress={async () => {
                    await onRequest(securityAnswer);
                  }}
                />
              </View>
            </View>

            <VerifyAndProceedButton
              onPress={async () => {
                try {
                  setVerifyButtonDisabledDoubleclick(true);
                  await onConfirm(key);
                  setVerifyButtonDisabledDoubleclick(false);
                } catch (e) {
                  const error = e as Error;
                  setVerifyButtonDisabledDoubleclick(false);
                  console.error(error);
                  Alert.alert(
                    intl.formatMessage({
                      id: "general.error",
                      defaultMessage: "Error",
                    }) + "VerifyAndProceedButton (1)",
                    error.message
                  );
                }
              }}
              disabled={
                verifyButtonDisabledDoubleclick
                  ? verifyButtonDisabledDoubleclick
                  : verifyButtonDisabled
              }
            />
          </View>
        );
      }

      return (
        <View
          style={{
            flexGrow: 1,
            flex: 1,
            paddingHorizontal: 20,
            justifyContent: "space-between",
          }}
        >
          <SecurityQuestionInput
            disabled
            securityQuestion={securityQuestion}
            securityAnswer={securityAnswer}
            onSecurityAnswerChange={setSecurityAnswer}
            CustomTextInput={BottomSheetTextInput}
          />

          <SendMagicSmsButton
            onPress={async () => {
              setMagicButtonDisabledDoubleclick(true);

              try {
                await onRequest(securityAnswer);
                setSentMessage(true);
                setMagicButtonDisabledDoubleclick(false);
              } catch (e) {
                const error = e as Error;
                setMagicButtonDisabledDoubleclick(false);
                console.error(error);
                Alert.alert("Sending SMS failed.", error.message);
              }
            }}
            disabled={
              magicButtonDisabledDoubleclick
                ? magicButtonDisabledDoubleclick
                : magicButtonDisabled
            }
          />
        </View>
      );
    }
  );
