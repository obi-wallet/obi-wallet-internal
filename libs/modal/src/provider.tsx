import { PortalHost } from "@gorhom/portal";
import { Provider as OriginalProvider, Env } from "@obi-wallet/common";
import { obiMobileConfig } from "@obi-wallet/config";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

export const Provider = observer<{ children: ReactNode; env: Env }>(
  function Provider({ children, env }) {
    return (
      <div
        id="obi-modal-container"
        ref={(container) => {
          if (!container) return;
          // @ts-expect-error TODO: hacky but works
          window["OBI_MODAL_CONTAINER"] = container;
        }}
        style={{
          display: "flex",
          flex: 1,
          transform: "scale(1)",
        }}
      >
        <OriginalProvider config={obiMobileConfig} env={env}>
          {children}
          <PortalHost name="modals" />
        </OriginalProvider>
      </div>
    );
  }
);
