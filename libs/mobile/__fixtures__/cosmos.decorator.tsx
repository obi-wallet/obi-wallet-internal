import { KVStore } from "@obi-wallet/common";
import { loopMobileDevConfig, obiMobileConfig } from "@obi-wallet/config";
import { observer } from "mobx-react-lite";
import { ReactNode, useEffect } from "react";
import { useSelect } from "react-cosmos/fixture";

import { Provider } from "../src";

const kvStore = new KVStore("react-cosmos");

enum Config {
  ObiMobile = "obi-mobile",
  LoopMobile = "loop-mobile",
}

export default observer(function CosmosDecorator({
  children,
}: {
  children: ReactNode;
}) {
  const [config, setConfig] = useSelect<Config>("config", {
    options: Object.values(Config),
  });

  useEffect(() => {
    (async () => {
      const config = await kvStore.get<Config>("config");
      if (config) {
        setConfig(config);
      }
    })();
  }, [setConfig]);

  useEffect(() => {
    (async () => {
      await kvStore.set("config", config);
    })();
  }, [config]);

  return <Provider config={getConfig()}>{children}</Provider>;

  function getConfig() {
    switch (config) {
      case Config.ObiMobile:
        return obiMobileConfig;
      case Config.LoopMobile:
        return loopMobileDevConfig;
    }
  }
});
