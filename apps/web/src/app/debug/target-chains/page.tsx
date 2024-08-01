"use client";

import { Button } from "@/components";
import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { observer } from "mobx-react-lite";

export default observer(function TargetChains() {
  const currentWallet = useCurrentWallet({});
  const { targetChainsStore } = useStore();

  if (!currentWallet) {
    return null;
  }

  const targetChains = targetChainsStore.getTargetChains(
    currentWallet.userEntryAddress,
  );

  return (
    <ul className="text-white">
      {targetChains.map((chain) => {
        return (
          <li key={chain.id}>
            {chain.targetChain.label}{" "}
            <Button
              variant={chain.config?.enabled === true ? "primary" : "outline"}
              onClick={() => {
                targetChainsStore.setTargetChainConfig({
                  address: currentWallet.userEntryAddress,
                  chainId: chain.id,
                  config: { enabled: true },
                });
              }}
            >
              Enable
            </Button>
            <Button
              variant={chain.config?.enabled === false ? "primary" : "outline"}
              onClick={() => {
                targetChainsStore.setTargetChainConfig({
                  address: currentWallet.userEntryAddress,
                  chainId: chain.id,
                  config: { enabled: false },
                });
              }}
            >
              Disable
            </Button>
            <Button
              variant={
                chain.config?.enabled === undefined ? "primary" : "outline"
              }
              onClick={() => {
                targetChainsStore.setTargetChainConfig({
                  address: currentWallet.userEntryAddress,
                  chainId: chain.id,
                  config: {},
                });
              }}
            >
              Auto ({chain.targetChain.disabled ? "disabled" : "enabled"})
            </Button>
          </li>
        );
      })}
    </ul>
  );
});
