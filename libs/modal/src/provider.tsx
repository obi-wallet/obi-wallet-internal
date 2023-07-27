import { PortalHost } from "@gorhom/portal";
import {
  BottomSheetContainerContext,
  Env,
  Provider as OriginalProvider,
} from "@obi-wallet/common";
import { Config } from "@obi-wallet/config";
import { observer } from "mobx-react-lite";
import { ReactNode, useRef } from "react";

export const Provider = observer<{
  children: ReactNode;
  env: Env;
  config: Config;
}>(function Provider({ children, env, config }) {
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
      <OriginalProvider config={config} env={env}>
        <BottomSheetContainerContext.Provider value={containerRef}>
          {children}
          <PortalHost name="modals" />
        </BottomSheetContainerContext.Provider>
      </OriginalProvider>
    </div>
  );
});
