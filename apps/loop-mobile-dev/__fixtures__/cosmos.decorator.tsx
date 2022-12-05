import { Provider } from "@obi-wallet/mobile";
import { ReactNode } from "react";

export default ({ children }: { children: ReactNode }) => {
  return <Provider>{children}</Provider>;
};
