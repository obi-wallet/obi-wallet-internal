import { mockAction } from "../../src/fixture-helpers";
import { Welcome } from "../../src/screens/welcome";

export default (
  <Welcome
    onCreate={mockAction("onCreate")}
    onRecover={mockAction("onRecover")}
    onEnterDemoMode={mockAction("onEnterDemoMode")}
  />
);
