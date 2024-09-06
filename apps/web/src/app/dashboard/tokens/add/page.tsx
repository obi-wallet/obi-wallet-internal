"use client";

import { Box, Button, ChainDropdown, Input } from "@/components";
import { useAlert } from "@/hooks/alert";
import { TargetChain, TargetChainId } from "@/target-chain";
import { CosmosChainId } from "@/target-chain/cosmos/chains";
import { AsyncButton } from "@/ui/button";
import { InputContainer } from "@/ui/container";
import { AssetRegistry } from "@obi-wallet/sdk-asset-registry";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default observer(function TokenAdd() {
  const alert = useAlert();
  const router = useRouter();
  const [chainId, setChainId] = useState<TargetChainId>(CosmosChainId.Sei);
  const [address, setAddress] = useState("");

  return (
    <div className="w-full">
      <Box className="w-full lg:w-1/2">
        <div className="my-4 flex-1 text-center text-white">
          Import New Asset
        </div>
        <InputContainer
          className="relative z-10 w-80"
          label="Chain"
          labelClassname="bg-background-secondary"
        >
          <ChainDropdown onChange={setChainId} chainId={chainId} />
        </InputContainer>
        <div className="my-4">
          <label className="text-sm text-white">Token Contract Address</label>
          <Input
            className="mt-2 px-3 py-3 text-sm"
            value={address}
            onChange={setAddress}
          />
        </div>

        <div className="mb-4 mt-0.5 flex gap-8 text-white">
          <Button
            onClick={() => {
              router.back();
            }}
            className="flex-1 justify-center rounded-lg border-blue-500 bg-transparent p-2 text-center"
          >
            Cancel
          </Button>
          <AsyncButton
            onClick={async () => {
              const targetChain = TargetChain.chainId(chainId);

              const { assetId } = await AssetRegistry.getInstance().byDenom({
                chainId: chainId,
                denom: address,
              });

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
