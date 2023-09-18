import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { View } from "react-native";

import { InlineButton } from "../../buttons";
import { TextInput } from "../../text-input";
import { Text } from "../../typography";
import { ComunicationType } from "@obi-wallet/sdk";

export interface PhoneOneTimeCodeInputProps {
  phoneNumber: string;
  value: string;
  phoneNumberMightBeIncorrect: boolean;
  setValue(value: string): void;
  onResend(type: ComunicationType): Promise<void>;
}

export const PhoneOneTimeCodeInput = observer<PhoneOneTimeCodeInputProps>(
  function PhoneOneTimeCodeInput({
    phoneNumber,
    phoneNumberMightBeIncorrect,
    value,
    setValue,
    onResend,
  }) {
    const intl = useIntl();
    const waitTime = 45;
    const theme = useTheme();
    const [resendButtonDisabled, setResendButtonDisabled] = useState(false);
    const [resendCounter, setResendCounter] = useState(waitTime);
    const [resendButtonHit, setResendButtonHit] = useState(false);

    useEffect(() => {
      if (resendCounter > 0) {
        setResendButtonDisabled(true);
        setTimeout(() => {
          setResendCounter((counter) => counter - 1);
        }, 1000);
      } else {
        setResendButtonDisabled(false);
      }
    }, [resendCounter]);

    return (
      <>
        <TextInput
          placeholder={intl.formatMessage({
            id: "onboarding3.smscodelabel",
          })}
          label="Enter SMS Code"
          textContentType="oneTimeCode"
          keyboardType="number-pad"
          style={{}}
          value={value}
          onChangeText={(value) => {
            const reg = /^\d*$/;
            if (reg.test(value)) {
              setValue(value);
            }
          }}
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            marginTop: 16,
            width: "100%",
          }}
        >
          <Text style={{ color: "rgba(246, 245, 255, 0.6)", fontSize: 12 }}>
            {/* <FormattedMessage
              id="onboarding3.noresponselabel"
              defaultMessage="Didn't receive a response?"
            /> */}
            Didn’t get a code?
          </Text>
          {resendCounter === 0 ? (
            <View style={{ flexDirection: "row" }}>
              <InlineButton
                style={{
                  ...theme.phoneKey.inlineButton,
                }}
                label="Resend"
                onPress={async () => {
                  setResendCounter(waitTime);
                  setResendButtonHit(true);

                  setValue("");

                  await onResend(ComunicationType.SMS);
                }}
                disabled={resendButtonDisabled}
              />
              <InlineButton
                style={{ ...theme.phoneKey.inlineButton }}
                label="Get a voice call instead"
                onPress={async () => {
                  setResendCounter(waitTime);
                  setResendButtonHit(true);

                  setValue("");

                  await onResend(ComunicationType.VOICE);
                }}
                disabled={resendButtonDisabled}
              />
            </View>
          ) : (
            <Text style={{ color: "rgba(246, 245, 255, 0.6)", fontSize: 12 }}>
              {" "}
              Wait {resendCounter} seconds to request a new code
            </Text>
          )}
        </View>

        {resendButtonHit && phoneNumberMightBeIncorrect ? (
          <Text
            style={{
              color: "rgba(246, 245, 255, 0.6)",
              fontSize: 12,
              marginVertical: 10,
            }}
          >
            <FormattedMessage
              id="onboarding3.sendagain.info.checknumber"
              defaultMessage="If you haven't received the Obi magic code please check if your phone number is correct:"
            />{" "}
            <Text style={{ fontWeight: "bold" }}>{phoneNumber}.</Text>
          </Text>
        ) : null}
      </>
    );
  },
);
