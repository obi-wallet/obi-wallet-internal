"use client";

import {
  Box,
  Button,
  ChainDropdown,
  Input,
  useChainOptions,
} from "@/components";
import { InfoIcon } from "@/components/info-icon";
import { useAlert } from "@/hooks/alert";
import { TargetChain, TargetChainId } from "@/target-chain";
import { AsyncButton } from "@/ui/button";
import { AssetRegistry } from "@obi-wallet/sdk-asset-registry";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useState } from "react";
import invariant from "tiny-invariant";

export default observer(function TokenAdd() {
  const alert = useAlert();
  const router = useRouter();
  const { initialValue } = useChainOptions();
  const [chainId, setChainId] = useState<TargetChainId | null>(null);
  const [address, setAddress] = useState("");

  const getChainId = () => {
    if (chainId) {
      return chainId;
    }

    return initialValue;
  };
  const chainIdToUse = getChainId();

  return (
    <div className="token-add-page w-full">
      <Box className="token-add-form w-full">
        <div className="token-add-title my-4 flex flex-1 items-center justify-center gap-2 text-center text-white">
          Track a New Asset
          <InfoIcon topicId="import_new_asset" />
        </div>
        <div className="flex items-center gap-2">
          <ChainDropdown
            onChange={setChainId}
            chainId={chainIdToUse}
            className="token-add-chain-select h-standardField border-foreground-primary-border relative z-10 w-full rounded-[5px] border"
          />
          <InfoIcon topicId="chain_selection" />
        </div>
        <div className="token-add-address-container my-4 w-full">
          <div className="flex items-center gap-2">
            <Input
              className="token-add-address-input mt-2 px-3 py-3 text-sm"
              value={address}
              placeholder="Paste Token Contract Address"
              onChange={setAddress}
            />
            <InfoIcon topicId="token_contract_address" />
          </div>
        </div>

        <div className="token-add-actions mb-4 mt-0.5 flex gap-8 text-white">
          <Button
            onClick={() => {
              router.back();
            }}
            variant="secondary"
            className="flex-1 justify-center rounded-lg p-2"
          >
            Cancel
          </Button>
          <AsyncButton
            onClick={async () => {
              invariant(chainIdToUse, "Chain ID is required");
              const targetChain = TargetChain.chainId(chainIdToUse);

              const assetRegistryInfo =
                await AssetRegistry.getInstance().byDenom({
                  chainId: chainIdToUse,
                  denom: address,
                });
              const assetId = assetRegistryInfo?.assetId;

              const assetInfo =
                assetId && (await targetChain.assetInfo(assetId));
              if (assetInfo && assetId) {
                await router.push(
                  `/dashboard/tokens/edit/${encodeURIComponent(assetId)}`,
                );
              } else {
                alert.showError("Invalid token address");
              }
            }}
            className="flex-1 justify-center rounded-lg p-2"
          >
            Add
          </AsyncButton>
        </div>
      </Box>
    </div>
  );
});
