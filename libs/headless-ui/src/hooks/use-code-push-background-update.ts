import { Duration, DurationLikeObject } from "luxon";
import { useRef, useState } from "react";
import codePush, { SyncOptions } from "react-native-code-push";

import { useAppStateEffect } from "./use-app-state-effect";

export interface CodePushBackgroundUpdateConfig extends SyncOptions {
  frequency: DurationLikeObject;
}

export function useCodePushBackgroundUpdate(
  config: CodePushBackgroundUpdateConfig
) {
  const lastUpdate = useRef(0);
  const [updating, setUpdating] = useState(false);
  const configRef = useRef(config);

  useAppStateEffect(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    async (appState) => {
      if (__DEV__ || appState !== "active") return;

      const { frequency, ...config } = configRef.current;

      const timeSinceLastUpdate = new Date().getTime() - lastUpdate.current;
      const shouldCheckForUpdate =
        timeSinceLastUpdate > Duration.fromObject(frequency).as("milliseconds");
      lastUpdate.current = new Date().getTime();
      if (!shouldCheckForUpdate) return;

      const updateAvailable = await codePush.checkForUpdate(
        config.deploymentKey
      );
      if (!updateAvailable) return;

      try {
        setUpdating(true);
        await codePush.sync({
          installMode: codePush.InstallMode.IMMEDIATE,
          ...config,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setUpdating(false);
      }
    },
    []
  );

  return updating;
}
