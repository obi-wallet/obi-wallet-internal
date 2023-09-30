import { Welcome } from "@obi-wallet/common";

import { mockAction } from "../../src/fixture-helpers";

export default (
  <Welcome
    onCreate={mockAction("onCreate")}
    onRecover={mockAction("onRecover")}
    onEnterDemoMode={mockAction("onEnterDemoMode")}
  />
);
