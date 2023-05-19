import { Provider as OriginalProvider, Env } from "@obi-wallet/common";
import { obiMobileConfig } from "@obi-wallet/config";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

export const Provider = observer<{ children: ReactNode; env: Env }>(
  function Provider({ children, env }) {
    return (
      <OriginalProvider config={obiMobileConfig} env={env}>
        {children}
      </OriginalProvider>
    );
  }
);
