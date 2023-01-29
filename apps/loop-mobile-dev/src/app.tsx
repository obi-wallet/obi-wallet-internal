import { loopMobileDevConfig } from "@obi-wallet/config";
import { BaseApp } from "@obi-wallet/mobile";
import { observer } from "mobx-react-lite";

export const App = observer(function App() {
  return <BaseApp initialConfig={loopMobileDevConfig} />;
});
