"use client";

import {
  Box,
  Button,
  ChainDropdown,
  Input,
  useChainOptions,
} from "@/components";
import { useAlert } from "@/hooks/alert";
import { TargetChain, TargetChainId } from "@/target-chain";
import { AsyncButton } from "@/ui/button";
import { InputContainer } from "@/ui/container";
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
      <Box className="token-add-form w-full lg:w-1/2">
        <div className="token-add-title my-4 flex-1 text-center text-white">
          Import New Asset
        </div>
        <InputContainer
          className="token-add-chain-select relative z-10 w-80"
          label="Chain"
          labelClassname="bg-background-secondary"
        >
          <ChainDropdown onChange={setChainId} chainId={chainIdToUse} />
        </InputContainer>
        <div className="token-add-address-container my-4">
          <label className="token-add-address-label text-sm text-white">Token Contract Address</label>
          <Input
            className="token-add-address-input mt-2 px-3 py-3 text-sm"
            value={address}
            onChange={setAddress}
          />
        </div>

        <div className="token-add-actions mb-4 mt-0.5 flex gap-8 text-white">
          <Button
            onClick={() => {
              router.back();
            }}
            className="token-add-cancel-btn flex-1 justify-center rounded-lg border-blue-500 bg-transparent p-2 text-center"
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
                router.push(
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
