import { observer } from "mobx-react-lite";

import { InitialBackground } from "./components/initial-background";

export const SplashScreen = observer(function SplashScreen() {
  return <InitialBackground />;
});
