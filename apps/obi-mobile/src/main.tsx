import { setupMain } from "@obi-wallet/mobile";

import { App } from "./app";

const appName = "money.obi.wallet";
const version = "0.14.0";
const codepushVersion = "66";

setupMain({
  App,
  release: `${appName}@${version}+codepush:v${codepushVersion}`,
  dist: codepushVersion,
});
