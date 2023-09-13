import { zodResolver } from "@hookform/resolvers/zod";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { Controller, useForm } from "react-hook-form";
import { FormattedMessage, useIntl } from "react-intl";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { useEnv, useStore } from "../../../../contexts";
import { Alert, isSmallScreenNumber } from "../../../../helpers";
import { getTwilioClient } from "../../../../keys";
import {
  KeyFlow,
  KeyRoute,
  KeyStackParamList,
  useRootNavigation,
} from "../../../../router";
import { KeyboardAwareScrollView } from "../../../keyboard-aware-scroll-view";
import { OsmosisScreenContainer } from "../../../osmosis-screen-container";
import {
  SecurityQuestionInput,
  SendMagicSmsButton,
  useSecurityQuestions,
} from "../../../phone-key";
import { TextInput } from "../../../text-input";
import { Text } from "../../../typography";

export type PhoneKeyRequestScreenProps = NativeStackScreenProps<
  KeyStackParamList,
  KeyRoute.PhoneKeyRequest
>;

export const PhoneKeyRequestScreen = observer<PhoneKeyRequestScreenProps>(
  function PhoneKeyRequestScreen({ route }) {
    const navigation = useRootNavigation();
    const { params } = route;

    return (
      <PhoneKeyRequest
        {...params}
        onSubmit={(payload) => {
          navigation.navigate(KeyRoute.PhoneKeyConfirm, {
            ...params,
            ...payload,
          });
        }}
      />
    );
  },
);

const schema = z.object({
  securityQuestion: z.string(),
  securityAnswer: z
    .string()
    .min(3, "Answer must contain at least 3 characters")
    .regex(/^[A-Za-z0-9.\sáéíóúñü_-]*$/, "Answer contains invalid characters"),
  phoneNumber: z.string(),
});

export interface PhoneKeyRequestProps {
  flow: KeyFlow;
  demoMode: boolean;
  phoneNumber?: string;
  onSubmit(payload: {
    phoneNumber: string;
    securityQuestion: string;
    securityAnswer: string;
  }): void;
}

export const PhoneKeyRequest = observer<PhoneKeyRequestProps>(
  function PhoneKeyRequest({ demoMode, flow, onSubmit, ...params }) {
    const intl = useIntl();
    const { chainStore } = useStore();
    const chainId = chainStore.currentChain;
    const env = useEnv();
    const securityQuestions = useSecurityQuestions();

    const { control, formState, handleSubmit } = useForm({
      defaultValues: {
        securityQuestion: securityQuestions[0].value,
        securityAnswer: "",
        phoneNumber: params.phoneNumber || "",
      },
      mode: "onChange",
      resolver: zodResolver(schema),
    });

    return (
      <OsmosisScreenContainer>
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAwareScrollView
            style={{
              flex: 1,
            }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View
              style={{
                flexGrow: 1,
                flex: 1,
                paddingHorizontal: 20,
                justifyContent: "space-between",
              }}
            >
              <View>
                <View
                  style={{
                    marginTop: 10,
                    paddingTop: isSmallScreenNumber(0, 32),
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: "#F6F5FF",
                        fontSize: isSmallScreenNumber(20, 24),
                        fontWeight: "600",
                        marginBottom: 10,
                      }}
                    >
                      {flow === KeyFlow.EditWallet ? (
                        <FormattedMessage
                          id="onboarding2.recovery.authyourkeys"
                          defaultMessage="Create a New Phone Number Key"
                        />
                      ) : flow === KeyFlow.RecoverWallet ? (
                        <FormattedMessage
                          id="onboarding2.recovery.phonenumber"
                          defaultMessage="Recover Your Old Phone Number Key"
                        />
                      ) : (
                        <FormattedMessage
                          id="onboarding2.authyourkeys"
                          defaultMessage="Create a Phone Number Key"
                        />
                      )}
                    </Text>
                    <Text
                      style={{
                        color: "white",
                        fontSize: isSmallScreenNumber(12, 14),
                      }}
                    >
                      {flow === KeyFlow.EditWallet ? (
                        <FormattedMessage
                          id="onboarding2.recovery.authyourkeyssubtext"
                          defaultMessage="Please answer a security question. It can be the same as your old answer, or different."
                        />
                      ) : (
                        <FormattedMessage
                          id="onboarding2.authyourkeyssubtext"
                          defaultMessage="Please answer a security question."
                        />
                      )}
                    </Text>
                  </View>
                </View>
                <Controller
                  name="securityQuestion"
                  control={control}
                  render={({ field }) => {
                    // TODO: dropdown / select
                    return (
                      <SecurityQuestionInput
                        securityQuestion={field.value}
                        onSecurityQuestionChange={(item) => {
                          field.onChange(item);
                        }}
                      />
                      // <TextInput
                      //   label="Security Question"
                      //   placeholder="Security Question"
                      //   style={{ flex: 1 }}
                      //   invalidMessage={fieldState.error?.message}
                      //   value={
                      //     securityQuestions.find(
                      //       ({ value }) => value === field.value
                      //     )?.label
                      //   }
                      // />
                    );
                  }}
                />
                <Controller
                  name="securityAnswer"
                  control={control}
                  render={({ field, fieldState }) => {
                    return (
                      <TextInput
                        label="Security Answer"
                        placeholder="Type your answer here"
                        style={{ flex: 1, marginVertical: 20 }}
                        invalidMessage={fieldState.error?.message}
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                      />
                    );
                  }}
                />
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field, fieldState }) => {
                    return (
                      <TextInput
                        label="Phone Number"
                        placeholder="+1123456789"
                        style={{ flex: 1 }}
                        invalidMessage={fieldState.error?.message}
                        value={field.value}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                      />
                    );
                  }}
                />
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-end",
                  marginBottom: 20,
                }}
              >
                <SendMagicSmsButton
                  description={intl.formatMessage({
                    id: "onboarding2.bottominfo",
                  })}
                  disabled={!formState.isValid}
                  onPress={handleSubmit(async (data) => {
                    try {
                      const twilioClient = getTwilioClient({ demoMode, env });
                      // TODO: factor back out this workaround
                      const res = await twilioClient.requestPublicKeyMagicCode({
                        ...data,
                        chainId,
                        voice: false,
                      });
                      /*
                      const res = await twilioClient.requestPublicKeyMagicCode({
                        ...data,
                        chainId,
                        voice: false,
                      });
                      */
                      console.log({ res });
                      onSubmit(data);
                    } catch (e) {
                      const error = e as Error;
                      console.error(error);
                      Alert.alert(
                        intl.formatMessage({
                          id: "onboarding2.error.sendingsmsfailed",
                        }),
                        error.message,
                      );
                    }
                  })}
                />
              </View>
            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </OsmosisScreenContainer>
    );
  },
);
