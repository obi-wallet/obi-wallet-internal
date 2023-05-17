import { AsyncButton, useStore } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { Keyboard } from "react-native";

import ShieldCheck from "./assets/shield-check.svg";

export interface VerifyAndProceedButtonProps {
  onPress: () => Promise<void>;
  disabled?: boolean;
}

export const VerifyAndProceedButton = observer(function VerifyAndProceedButton({
  onPress,
  disabled,
}: VerifyAndProceedButtonProps) {
  const intl = useIntl();
  const { configStore } = useStore();
  const isObi = configStore.isObi();
  return (
    <AsyncButton
      label={intl.formatMessage({
        id: "onboarding3.verifyandproceed",
        defaultMessage: "Verify & Proceed",
      })}
      LeftIcon={isObi ? undefined : ShieldCheck}
      flavor={disabled ? "gray" : "blue"}
      onPress={async () => {
        Keyboard.dismiss();
        if (!disabled) {
          await onPress();
        }
      }}
      disabled={disabled}
    />
  );
});
