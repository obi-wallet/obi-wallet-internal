import "@obi-wallet/mobile-shim";

import * as Sentry from "@sentry/react-native";
import { ComponentType } from "react";
import { AppRegistry } from "react-native";
import "react-native-gesture-handler";
import codePush from "react-native-code-push";
import { COSMOS_ENABLED } from "react-native-dotenv";
import { LaunchArguments } from "react-native-launch-arguments";

import { deploymentKey } from "./app/code-push";
import { initSentry } from "./background/sentry";
import { Cosmos } from "./cosmos";
import { FixturePicker } from "./fixture-helpers/fixture-picker";

export function setupMain({
  App,
  release,
  dist,
}: {
  App: ComponentType;
  release: string;
  dist: string;
}) {
  initSentry({ release, dist });

  AppRegistry.registerComponent("Mobile", () => {
    const launchArguments = LaunchArguments.value<{ fixture?: string }>();

    if (typeof launchArguments.fixture === "string") return FixturePicker;

    if (__DEV__ && COSMOS_ENABLED === "true") return Cosmos;

    let Component = App;

    if (!__DEV__) {
      Component = Sentry.wrap(App);
      Component = codePush({
        checkFrequency: codePush.CheckFrequency.MANUAL,
        deploymentKey,
      })(Component);
    }

    return Component;
  });
}
