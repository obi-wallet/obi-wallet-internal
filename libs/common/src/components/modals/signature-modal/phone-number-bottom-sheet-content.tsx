import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { View } from "react-native";

import { useStore } from "../../../contexts";
import { Alert } from "../../../helpers";
import { BottomSheetTextInput } from "../../bottom-sheet";
import {
  PhoneOneTimeCodeInput,
  SecurityQuestionInputWithAnswer,
  SendMagicSmsButton,
  useSecurityQuestionInput,
} from "../../phone-key";
import { Text } from "../../typography";
import { VerifyAndProceedButton } from "../../verify-and-proceed-button";

export interface PhoneNumberBottomSheetContentProps {
  phoneNumber: string;
  securityQuestion: string;

  onRequest(data: { voice: boolean; securityAnswer: string }): Promise<void>;

  onConfirm(key: string): Promise<void>;
}

export const PhoneNumberBottomSheetContent =
  observer<PhoneNumberBottomSheetContentProps>(
    function PhoneNumberBottomSheetContent({
      phoneNumber,
      securityQuestion,
      onRequest,
      onConfirm,
    }) {
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

              <PhoneOneTimeCodeInput
                phoneNumber={phoneNumber}
                phoneNumberMightBeIncorrect={false}
                value={key}
                setValue={setKey}
                onResend={async (voice) => {
                  await onRequest({ securityAnswer, voice });
                }}
              />
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
          <SecurityQuestionInputWithAnswer
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
                await onRequest({ securityAnswer, voice: false });
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
