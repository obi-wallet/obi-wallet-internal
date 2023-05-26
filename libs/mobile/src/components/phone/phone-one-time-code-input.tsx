import { Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { View } from "react-native";

import { InlineButton } from "../../app/button";
import { TextInput } from "../../app/text-input";

export interface PhoneOneTimeCodeInputProps {
  phoneNumber: string;
  value: string;
  phoneNumberMightBeIncorrect: boolean;
  setValue(value: string): void;
  onResend(voice: boolean): Promise<void>;
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
          textContentType="oneTimeCode"
          keyboardType="number-pad"
          style={{ marginTop: 25 }}
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
            flexDirection: "column",
            alignItems: "flex-start",
            marginTop: 24,
            width: "100%",
          }}
        >
          <Text style={{ color: "rgba(246, 245, 255, 0.6)", fontSize: 12 }}>
            <FormattedMessage
              id="onboarding3.noresponselabel"
              defaultMessage="Didn’t receive a response?"
            />
          </Text>
          {resendCounter === 0 ? (
            <>
              <View style={{ flexDirection: "row", marginTop: 10 }}>
                <InlineButton
                  label={`${intl.formatMessage({
                    id: "onboarding3.sendagain",
                  })} SMS`}
                  onPress={async () => {
                    setResendCounter(waitTime);
                    setResendButtonHit(true);

                    setValue("");

                    await onResend(false);
                  }}
                  disabled={resendButtonDisabled}
                />
                <InlineButton
                  label="Get a voice call instead"
                  onPress={async () => {
                    setResendCounter(waitTime);
                    setResendButtonHit(true);

                    setValue("");

                    await onResend(true);
                  }}
                  disabled={resendButtonDisabled}
                />
              </View>
            </>
          ) : (
            <Text style={{ color: "rgba(246, 245, 255, 0.6)", fontSize: 12 }}>
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
  }
);
