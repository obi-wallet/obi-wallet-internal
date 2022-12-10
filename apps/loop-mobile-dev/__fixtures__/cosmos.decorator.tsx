import { Provider } from "@obi-wallet/mobile";
import { ReactNode } from "react";

import { config } from "../src/config";

export default ({ children }: { children: ReactNode }) => {
  return <Provider initialConfig={config}>{children}</Provider>;
};
