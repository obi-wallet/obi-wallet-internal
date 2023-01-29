import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { Keyboard, StyleProp, ViewStyle } from "react-native";

import ShieldCheck from "./assets/shield-check.svg";
import { Button } from "../../../button";
import { useStore } from "../../../stores";

export interface VerifyAndProceedButtonProps {
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const VerifyAndProceedButton = observer(function VerifyAndProceedButton({
  onPress,
  disabled,
  style,
}: VerifyAndProceedButtonProps) {
  const intl = useIntl();
  const { configStore } = useStore();
  const isObi = configStore.isObi();
  return (
    <Button
      label={intl.formatMessage({
        id: "onboarding3.verifyandproceed",
        defaultMessage: "Verify & Proceed",
      })}
      LeftIcon={isObi ? undefined : ShieldCheck}
      flavor={disabled ? "gray" : "blue"}
      onPress={() => {
        Keyboard.dismiss();
        !disabled && onPress();
      }}
      disabled={disabled}
      style={[{ marginBottom: 20 }, style]}
    />
  );
});
