import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { Keyboard } from "react-native";

import { AsyncButton } from "../buttons";

export interface VerifyAndProceedButtonProps {
  onPress: () => Promise<void>;
  disabled?: boolean;
  labelOverride?: string;
}

export const VerifyAndProceedButton = observer(function VerifyAndProceedButton({
  onPress,
  disabled,
  labelOverride,
}: VerifyAndProceedButtonProps) {
  const intl = useIntl();
  return (
    <AsyncButton
      label={intl.formatMessage({
        id: labelOverride ? labelOverride : "onboarding3.verifyandproceed",
        defaultMessage: labelOverride ? labelOverride : "Verify & Proceed",
      })}
      flavor="primary"
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
