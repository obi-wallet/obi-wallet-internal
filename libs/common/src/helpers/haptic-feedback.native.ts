import ReactNativeHapticFeedback from "react-native-haptic-feedback";

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export function triggerNotificationSuccess() {
  ReactNativeHapticFeedback.trigger("notificationSuccess", options);
}

export function triggerImpactLight() {
  ReactNativeHapticFeedback.trigger("impactLight", options);
}
