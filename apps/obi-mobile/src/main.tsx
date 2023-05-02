import { setupMain } from "@obi-wallet/mobile";

import { createApp } from "./app";

const appName = "money.obi.wallet";
const version = "0.14.1";
const codepushVersion = "70";
const release = `${appName}@${version}+codepush:v${codepushVersion}`;

setupMain({
  App: createApp(release),
  release,
  dist: codepushVersion,
});
