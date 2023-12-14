import { useCallback, useRef, useState } from "react";
import codePush, { SyncOptions } from "react-native-code-push";
import { useThrottle } from "rooks";

import { useAppStateEffect } from "./app-state-effect";

/**
 * Checks for updates when the app becomes active. Install mode defaults to codePush.InstallMode.IMMEDIATE.
 *
 * @param options react-native-code-push sync options. We won't track changes to this config.
 * @returns true if an update is being downloaded and installed
 */
export function useCodePushBackgroundUpdate(options: SyncOptions) {
  const [updating, setUpdating] = useState(false);
  const optionsRef = useRef(options);
  const [backgroundUpdate] = useThrottle(
    useCallback(async () => {
      if (__DEV__) return;

      const options = optionsRef.current;

      const updateAvailable = await codePush.checkForUpdate(
        options.deploymentKey,
      );
      if (!updateAvailable) return;

      try {
        setUpdating(true);
        await codePush.sync({
          installMode: codePush.InstallMode.IMMEDIATE,
          ...options,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setUpdating(false);
      }
    }, []),
    5000,
  );

  useAppStateEffect(
    (appState) => {
      if (appState !== "active") return;
      void backgroundUpdate();
    },
    [backgroundUpdate],
  );

  return updating;
}
