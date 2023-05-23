import { PortalHost } from "@gorhom/portal";
import {
  Env,
  Provider as OriginalProvider,
  BottomSheetContainerContext,
} from "@obi-wallet/common";
import { obiMobileConfig } from "@obi-wallet/config";
import { observer } from "mobx-react-lite";
import { ReactNode, useRef, useState } from "react";

export const Provider = observer<{ children: ReactNode; env: Env }>(
  function Provider({ children, env }) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    return (
      <div
        style={{
          display: "flex",
          flex: 1,
          transform: "scale(1)",
        }}
        ref={containerRef}
      >
        <OriginalProvider config={obiMobileConfig} env={env}>
          <BottomSheetContainerContext.Provider value={containerRef}>
            {children}
            <PortalHost name="modals" />
          </BottomSheetContainerContext.Provider>
        </OriginalProvider>
      </div>
    );
  }
);
