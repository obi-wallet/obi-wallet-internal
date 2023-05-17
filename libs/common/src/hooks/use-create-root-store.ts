import { Config } from "@obi-wallet/config";
import { useEffect } from "react";
import { NativeModules, Platform } from "react-native";

import { RootStore } from "../stores";

const deviceLanguage = Platform.select({
  ios: () => {
    return (
      NativeModules.SettingsManager.settings.AppleLocale || // iOS
      NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
    ); // iOS 13
  },
  android: () => {
    return NativeModules.I18nManager.localeIdentifier;
  },
  default: () => {
    return "en";
  },
})();

export const rootStore: { current: RootStore | null } = { current: null };

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
