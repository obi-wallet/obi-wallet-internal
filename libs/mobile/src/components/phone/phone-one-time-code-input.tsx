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
  onResend(): Promise<void>;
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

    const [resendButtonDisabled, setResendButtonDisabled] = useState(false);
    const [resendCounter, setResendCounter] = useState(0);
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
            flexDirection: "row",
            alignItems: "center",
            marginTop: 24,
          }}
        >
          <Text style={{ color: "rgba(246, 245, 255, 0.6)", fontSize: 12 }}>
            <FormattedMessage
              id="onboarding3.noresponselabel"
              defaultMessage="Didn’t receive a response?"
            />
          </Text>

          <InlineButton
            label={intl.formatMessage({ id: "onboarding3.sendagain" })}
            onPress={async () => {
              setResendCounter(20);
              setResendButtonHit(true);

              setValue("");

              await onResend();
            }}
            disabled={resendButtonDisabled}
          />
        </View>

        {resendButtonDisabled ? (
          <Text
            style={{
              color: "rgba(246, 245, 255, 0.6)",
              fontSize: 12,
              marginVertical: 10,
            }}
          >
            <FormattedMessage
              id="onboarding3.sendagain.info.counter"
              defaultMessage="Your Magic SMS has been resent! Give it some time to arrive. You can try again in "
            />
            &nbsp;{resendCounter} {resendCounter > 0 ? "seconds" : "second"}.
          </Text>
        ) : null}

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
              defaultMessage="If you haven't received the SMS please check if your phone number is correct:"
            />{" "}
            {phoneNumber}.
          </Text>
        ) : null}
      </>
    );
  }
);
