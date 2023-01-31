import { Alert } from "react-native";

import { Welcome } from "../../src/screens/welcome";

function mockAction(message: string) {
  return () => {
    Alert.alert(message);
  };
}

export default (
  <Welcome
    onCreate={mockAction("onCreate")}
    onRecover={mockAction("onRecover")}
    onRecoverSinglesig={mockAction("onRecoverSinglesig")}
    onEnterDemoMode={mockAction("onEnterDemoMode")}
  />
);
