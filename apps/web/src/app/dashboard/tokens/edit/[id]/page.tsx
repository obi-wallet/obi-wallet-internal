"use client";

import { Box, Button, Input } from "@/components";
import { useStore } from "@/contexts";
import { useCreateViewingKey } from "@/hooks/use-create-viewing-key";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { TargetChain } from "@/target-chain";
import { isSecretChainId } from "@/target-chain/secret/chains";
import { AsyncButton } from "@/ui/button";
import { AssetInfo } from "@obi-wallet/sdk-abstract-target-chain";
import { Caip19AssetId, parseCaip19AssetId } from "@obi-wallet/sdk-caip";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEffectOnceWhen } from "rooks";

export default observer<{ params: { id: Caip19AssetId } }>(function TokenEdit({
  params,
}) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const assetId = decodeURIComponent(params.id) as Caip19AssetId;
  const { chainId, reference } = parseCaip19AssetId(assetId);

  const wallet = useCurrentWallet({});
  const router = useRouter();
  const { tokensStore, viewingKeysStore } = useStore();
  const createViewingKey = useCreateViewingKey();

  const [state, setState] = useState<{
    enabled: boolean;
    assetInfo: AssetInfo;
  }>({
    enabled: true,
    assetInfo: {
      name: "",
      symbol: "",
      decimals: 0,
      image: "",
    },
  });

  useEffectOnceWhen(async () => {
    if (wallet) {
      const persistedAssetInfo = tokensStore.getTokenConfig({
        address: wallet.userEntryAddress,
        assetId,
      });
      if (persistedAssetInfo) {
        setState({
          enabled: persistedAssetInfo.enabled ?? true,
          assetInfo: persistedAssetInfo.assetInfo ?? {
            name: "",
            symbol: "",
            decimals: 0,
            image: "",
          },
        });
      } else {
        const assetInfo = await TargetChain.chainId(chainId).assetInfo(assetId);
        if (assetInfo) {
          setState({
            assetInfo,
            enabled: true,
          });
        }
      }
    }
  }, !!wallet);

  if (!wallet) return null;

  return (
    <div className="w-full">
      <Box className="w-full lg:w-1/2">
        <div className="my-4 flex-1 text-center text-white">Edit Asset</div>
        <div className="my-4">
          <label className="text-sm text-white">Token ID</label>
          <Input className="mt-2 px-3 py-3 text-sm" disabled value={assetId} />
        </div>
        <div className="my-4">
          <label className="text-sm text-white">Token Symbol</label>
          <Input
            className="mt-2 px-3 py-3 text-sm"
            value={state.assetInfo?.symbol ?? ""}
            onChange={(value) => {
              setState({
                ...state,
                assetInfo: {
                  ...state.assetInfo,
                  symbol: value,
                },
              });
            }}
          />
        </div>
        <div className="my-4">
          <label className="text-sm text-white">Token Name</label>
          <Input
            className="mt-2 px-3 py-3 text-sm"
            value={state.assetInfo?.name ?? ""}
            onChange={(value) => {
              setState({
                ...state,
                assetInfo: {
                  ...state.assetInfo,
                  name: value,
                },
              });
            }}
          />
        </div>
        <div className="my-4">
          <label className="text-sm text-white">Token Decimals</label>
          <Input
            className="mt-2 px-3 py-3 text-sm"
            value={state.assetInfo?.decimals.toString() ?? ""}
            onChange={(value) => {
              setState({
                ...state,
                assetInfo: {
                  ...state.assetInfo,
                  decimals: parseInt(value, 10) ?? 0,
                },
              });
            }}
          />
        </div>
        <div className="my-4">
          <label className="text-sm text-white">Token Image</label>
          <Input
            className="mt-2 px-3 py-3 text-sm"
            value={state.assetInfo?.image ?? ""}
            onChange={(value) => {
              setState({
                ...state,
                assetInfo: {
                  ...state.assetInfo,
                  image: value,
                },
              });
            }}
          />
        </div>
        <div className="mb-4 mt-0.5 flex gap-8 text-white">
          <Button
            onClick={() => {
              tokensStore.removeTokenConfig({
                address: wallet.userEntryAddress,
                assetId,
              });
              viewingKeysStore.removeViewingKey({
                address: wallet.userEntryAddress,
                assetId,
              });
              router.back();
            }}
            className="flex-1 justify-center rounded-lg border-red-500 bg-transparent p-2 text-center hover:border-red-500 hover:bg-red-500"
          >
            Remove
          </Button>
          <Button
            onClick={() => {
              router.back();
            }}
            className="flex-1 justify-center rounded-lg border-blue-500 bg-transparent p-2 text-center"
          >
            Cancel
          </Button>
          <AsyncButton
            disabled={
              !state.assetInfo.symbol ||
              !state.assetInfo.name ||
              !state.assetInfo.decimals
            }
            onClick={async () => {
              tokensStore.setTokenConfig({
                address: wallet.userEntryAddress,
                assetId,
                config: state,
              });

              if (reference && isSecretChainId(chainId)) {
                const viewingKey = viewingKeysStore.getViewingKey({
                  address: wallet.userEntryAddress,
                  assetId,
                });
                if (!viewingKey) {
                  await createViewingKey(assetId);
                }
              }

              router.push("/dashboard");
            }}
            className="flex-1 justify-center rounded-lg p-2"
          >
            Save
          </AsyncButton>
        </div>
      </Box>
    </div>
  );
});
