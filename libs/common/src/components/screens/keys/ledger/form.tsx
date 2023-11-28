import { zodResolver } from "@hookform/resolvers/zod";
import { observer } from "mobx-react-lite";
import { Controller, useForm } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import { View } from "react-native";
import { z } from "zod";

import { isSmallScreenNumber } from "../../../../helpers";
import { useKeyboardVisible } from "../../../../hooks";
import { KeyFlow } from "../../../../router";
import { TextInput } from "../../../text-input";
import { Text } from "../../../typography";
import { VerifyAndProceedButton } from "../../../verify-and-proceed-button";

export type LedgerKeySubmitData = z.infer<typeof schema>;

export type LedgerKeyFormProps = {
  flow: KeyFlow;
  submitter: (data: LedgerKeySubmitData) => Promise<void>;
};

const schema = z.object({
  accountNumber: z.number().nonnegative("Can't be a negative number"),
});

export const LedgerKeyForm = observer<LedgerKeyFormProps>(
  function LedgerKeyForm({ flow, submitter }) {
    const { control, handleSubmit, formState } = useForm({
      resolver: zodResolver(schema),
      mode: "onChange",
      defaultValues: {
        accountNumber: 0,
      },
    });

    const isKeyboardVisible = useKeyboardVisible();

    return (
      <>
        <Text
          style={{
            color: "#F6F5FF",
            fontSize: isSmallScreenNumber(20, 24),
            fontWeight: "600",
            marginTop: isSmallScreenNumber(20, 32),
            textAlign: "center",
          }}
        >
          {flow === KeyFlow.EditWallet || flow === KeyFlow.RecoverWallet ? (
            <FormattedMessage
              id="onboarding5.recovery.setledgerkey"
              defaultMessage="Set a Ledger Recovery Key"
            />
          ) : (
            <FormattedMessage
              id="onboarding5.setledgerkey"
              defaultMessage="Set a Ledger Key"
            />
          )}
        </Text>

        <Text
          style={{
            color: "#fff",
            fontSize: isSmallScreenNumber(12, 14),
            marginTop: 10,
          }}
        >
          <FormattedMessage
            id="onboarding5.setbip32accountindex"
            defaultMessage="Enter account number of you Ledger wallet account. Note: only advanced users"
          />
        </Text>
        <Controller
          name="accountNumber"
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => {
            return (
              <TextInput
                placeholder="e.g. 0"
                autoCapitalize="none"
                inputMode="numeric"
                style={{ marginTop: 25 }}
                inputStyle={{
                  ...(formState.errors.accountNumber
                    ? { borderColor: "red" }
                    : {}),
                }}
                value={String(value)}
                onBlur={onBlur}
                onChangeText={(text) => {
                  onChange(text);
                }}
              />
            );
          }}
        />

        <View style={{ flex: 1, justifyContent: "flex-end", marginBottom: 20 }}>
          {!isKeyboardVisible ? (
            <VerifyAndProceedButton
              labelOverride="Connect Ledger"
              disabled={!formState.isValid}
              onPress={handleSubmit(submitter)}
            />
          ) : null}
        </View>
      </>
    );
  },
);
