import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { Keyboard } from "react-native";

import { useStore } from "../../contexts";
import { AsyncButton } from "../buttons";

export interface VerifyAndProceedButtonProps {
  onPress: () => Promise<void>;
  disabled?: boolean;
}

export const VerifyAndProceedButton = observer(function VerifyAndProceedButton({
  onPress,
  disabled,
}: VerifyAndProceedButtonProps) {
  const intl = useIntl();
  return (
    <AsyncButton
      label={intl.formatMessage({
        id: "onboarding3.verifyandproceed",
        defaultMessage: "Verify & Proceed",
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
