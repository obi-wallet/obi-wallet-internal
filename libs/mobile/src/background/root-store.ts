import { Config, RootStore } from "@obi-wallet/common";
import { NativeModules, Platform } from "react-native";
import invariant from "tiny-invariant";

const deviceLanguage =
  Platform.OS === "ios"
    ? NativeModules.SettingsManager.settings.AppleLocale || // iOS
      NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
    : NativeModules.I18nManager.localeIdentifier; // Android

export const rootStore: { current: RootStore | null } = { current: null };

export function getRootStore(): RootStore {
  invariant(rootStore.current, "Expected `rootStore` to be initialized.");
  return rootStore.current;
}

export function createRootStore({ config }: { config: Config }): RootStore {
  if (rootStore.current) {
    rootStore.current.configStore.setConfig(config);
  } else {
    rootStore.current = new RootStore({
      deviceLanguage: deviceLanguage.slice(0, 2),
      initialConfig: config,
    });
  }

  return rootStore.current;
}
