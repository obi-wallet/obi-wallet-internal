import { PortalHost } from "@gorhom/portal";
import {
  BottomSheetContainerContext,
  Env,
  Provider as OriginalProvider,
} from "@obi-wallet/common";
import { obiModalConfig } from "@obi-wallet/config";
import { CustomTheme } from "@obi-wallet/theme";
import { observer } from "mobx-react-lite";
import { ReactNode, useMemo, useRef } from "react";

export const Provider = observer<{
  children: ReactNode;
  env: Env;
  theme?: CustomTheme;
}>(function Provider({ children, env, theme }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const config = useMemo(() => {
    if (!theme) return obiModalConfig;

    return {
      ...obiModalConfig,
      theme,
    };
  }, [theme]);

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
