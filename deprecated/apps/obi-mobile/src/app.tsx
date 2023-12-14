import { obiMobileConfig } from "@obi-wallet/config";
import { BaseApp } from "@obi-wallet/mobile";
import { observer } from "mobx-react-lite";

export function createApp(buster?: string) {
  return observer(function App() {
    return (
      <BaseApp initialConfig={obiMobileConfig} providerProps={{ buster }} />
    );
  });
}
