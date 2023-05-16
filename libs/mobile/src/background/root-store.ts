import { Config, RootStore } from "@obi-wallet/common-deprecated";
import { useEffect } from "react";
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

export function useCreateRootStore({ config }: { config: Config }): RootStore {
  useEffect(() => {
    rootStore.current?.configStore.setConfig(config);
  }, [config]);

  if (!rootStore.current) {
    rootStore.current = new RootStore({
      deviceLanguage: deviceLanguage.slice(0, 2),
      initialConfig: config,
    });
  }

  return rootStore.current;
}
