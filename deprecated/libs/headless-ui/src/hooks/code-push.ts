import type { SyncOptions } from "react-native-code-push";

/**
 * Checks for updates when the app becomes active. Install mode defaults to codePush.InstallMode.IMMEDIATE.
 *
 * @param _options react-native-code-push sync options. We won't track changes to this config.
 * @returns true if an update is being downloaded and installed
 */
export function useCodePushBackgroundUpdate(_options: SyncOptions) {
  return false;
}
