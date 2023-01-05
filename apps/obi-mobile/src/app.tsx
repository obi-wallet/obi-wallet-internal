import { BaseApp } from "@obi-wallet/mobile";

import { config } from "./config";

export function App() {
  return <BaseApp initialConfig={config} />;
}
