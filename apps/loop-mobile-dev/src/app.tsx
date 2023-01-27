import { loopMobileDevConfig } from "@obi-wallet/config";
import { BaseApp } from "@obi-wallet/mobile";

export function App() {
  return <BaseApp initialConfig={loopMobileDevConfig} />;
}
