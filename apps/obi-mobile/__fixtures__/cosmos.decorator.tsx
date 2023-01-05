import { Brand } from "@obi-wallet/common";
import { Provider, useStore } from "@obi-wallet/mobile";
import { ReactNode, useEffect } from "react";
import { useSelect } from "react-cosmos/fixture";

import { config } from "../src/config";

export default ({ children }: { children: ReactNode }) => {
  return (
    <Provider initialConfig={config}>
      <BrandChooser />
      {children}
    </Provider>
  );
};

function BrandChooser() {
  const { configStore } = useStore();
  const [brand] = useSelect("brand", {
    options: [Brand.Obi, Brand.Loop],
  });

  useEffect(() => {
    if (brand !== configStore.brand) {
      configStore.toggleBrand();
    }
  }, [configStore, brand]);

  return null;
}
