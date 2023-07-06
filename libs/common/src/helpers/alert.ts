import type { Alert as RNAlert } from "react-native";

const alert: typeof RNAlert.alert = (title, description, options, _extra) => {
  const result = window.confirm(
    [title, description].filter(Boolean).join("\n")
  );

  if (result) {
    const confirmOption = options?.find(({ style }) => style !== "cancel");
    if (confirmOption?.onPress) {
      confirmOption.onPress();
    }
  } else {
    const cancelOption = options?.find(({ style }) => style === "cancel");
    if (cancelOption?.onPress) {
      cancelOption.onPress();
    }
  }
};

export const Alert = {
  alert,
};
