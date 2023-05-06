import {
  loopMobileDevConfig,
  obiMobileConfig,
  obiMobileMultichainConfig,
} from "@obi-wallet/config";
import { KVStore } from "@obi-wallet/headless-ui";
import { observer } from "mobx-react-lite";
import { ReactNode, useRef } from "react";
import { useSelect } from "react-cosmos/fixture";
import { useAsyncEffect } from "rooks";

import { Provider } from "../src";

const kvStore = new KVStore("react-cosmos");

enum Config {
  ObiMobile = "obi-mobile",
  ObiMobileMultichain = "obi-mobile-multichain",
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
  const ready = useRef(false);

  useAsyncEffect(async () => {
    const config = await kvStore.get<Config>("config");
    if (config) {
      setConfig(config);
    }
    ready.current = true;
  }, [setConfig]);

  useAsyncEffect(async () => {
    if (!ready.current) return;
    await kvStore.set("config", config);
  }, [config]);

  return <Provider config={getConfig()}>{children}</Provider>;

  function getConfig() {
    switch (config) {
      case Config.ObiMobile:
        return obiMobileConfig;
      case Config.ObiMobileMultichain:
        return obiMobileMultichainConfig;
      case Config.LoopMobile:
        return loopMobileDevConfig;
    }
  }
});
