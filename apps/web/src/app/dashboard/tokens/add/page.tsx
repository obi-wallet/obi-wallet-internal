"use client";

import { Box, Button, ChainDropdown, Input } from "@/components";
import { useAddressQuery } from "@/hooks/address";
import { useAlert } from "@/hooks/alert";
import { TargetChain, TargetChainId } from "@/target-chain";
import { CosmosChainId } from "@/target-chain/cosmos/chains";
import { SecretChainId } from "@/target-chain/secret/chains";
import { InputContainer } from "@/ui/container";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default observer(function TokenAdd() {
  const alert = useAlert();
  const router = useRouter();
  const [chainId, setChainId] = useState<TargetChainId>(CosmosChainId.Sei);
  const [address, setAddress] = useState("");
  const chainAddress = useAddressQuery(chainId);

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
          <Button
            onClick={async () => {
              const targetChain = TargetChain.chainId(chainId);
              let assetId: Caip19AssetId | null = null;
              if (chainId === SecretChainId.Secret) {
                const isPrivateAsset = await TargetChain.chainId(
                  chainId,
                ).isPrivateAsset(chainAddress, address);
                if (isPrivateAsset) {
                  assetId = `${chainId}/snip20:${address.replace("/", "%2F")}`;
                } else {
                  assetId = targetChain.denomToCaip19AssetId(address);
                }
              } else {
                assetId = targetChain.denomToCaip19AssetId(address);
              }
              const assetInfo =
                assetId && (await targetChain.newAssetInfo(assetId));
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
          </Button>
        </div>
      </Box>
    </div>
  );
});
