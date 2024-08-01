"use client";

import { Button } from "@/components";
import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { observer } from "mobx-react-lite";
import { mapObjIndexed } from "ramda";

export default observer(function Tokens() {
  const currentWallet = useCurrentWallet({});
  const { tokensStore } = useStore();

  if (!currentWallet) {
    return null;
  }

  const tokens = tokensStore.getTokensConfig(currentWallet.userEntryAddress);

  return (
    <ul className="text-white">
      {Object.values(
        mapObjIndexed((config, id) => {
          return (
            <li key={id}>
              <code>{id}</code> {config?.assetInfo?.symbol}{" "}
              <Button
                variant={config?.enabled === true ? "primary" : "outline"}
                onClick={() => {
                  tokensStore.setTokenConfig({
                    address: currentWallet.userEntryAddress,
                    assetId: id,
                    config: {
                      ...config,
                      enabled: true,
                    },
                  });
                }}
              >
                Enable
              </Button>
              <Button
                variant={config?.enabled !== true ? "primary" : "outline"}
                onClick={() => {
                  tokensStore.setTokenConfig({
                    address: currentWallet.userEntryAddress,
                    assetId: id,
                    config: {
                      ...config,
                      enabled: false,
                    },
                  });
                }}
              >
                Disable
              </Button>{" "}
              <Button
                variant="primary"
                href={`/dashboard/tokens/edit/${encodeURIComponent(id)}`}
              >
                Edit
              </Button>{" "}
              <Button
                variant="outline"
                onClick={() => {
                  tokensStore.removeTokenConfig({
                    address: currentWallet.userEntryAddress,
                    assetId: id,
                  });
                }}
              >
                Delete
              </Button>
            </li>
          );
        }, tokens),
      )}
      <li>
        <Button variant="primary" href="/dashboard/tokens/add">
          Add
        </Button>
      </li>
    </ul>
  );
});
