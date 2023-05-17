import { Provider as OriginalProvider } from "@obi-wallet/common";
import { obiMobileConfig } from "@obi-wallet/config";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

export const Provider = observer<{ children: ReactNode }>(function Provider({
  children,
}) {
  return (
    <OriginalProvider config={obiMobileConfig}>{children}</OriginalProvider>
  );
});
