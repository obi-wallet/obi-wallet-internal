"use client";

import { Box, Button, Input } from "@/components";
import { useStore } from "@/contexts";
import { useCreateViewingKey } from "@/hooks/use-create-viewing-key";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { cn } from "@/lib/utils";
import { TargetChain } from "@/target-chain";
import { isSecretChainId } from "@/target-chain/secret/chains";
import { AsyncButton } from "@/ui/button";
import { AssetInfo } from "@obi-wallet/sdk-abstract-target-chain";
import { Caip19AssetId, parseCaip19AssetId } from "@obi-wallet/sdk-caip";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { useEffectOnceWhen } from "rooks";

export default observer<{ params: Promise<{ id: Caip19AssetId }> }>(
  function TokenEdit(props) {
    const params = use(props.params);
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const assetId = decodeURIComponent(params.id) as Caip19AssetId;
    const { chainId, reference } = parseCaip19AssetId(assetId);

    const wallet = useCurrentWallet();
    const router = useRouter();
    const { tokensStore, viewingKeysStore, educationStore } = useStore();
    const createViewingKey = useCreateViewingKey();

    // Check if we came from the import flow by checking if the token exists
    const isImportFlow =
      !wallet?.userEntryAddress ||
      !tokensStore.getTokenConfig({
        address: wallet.userEntryAddress,
        assetId,
      });

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
        educationStore.setTopicById("confirm_asset");
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
          const assetInfo =
            await TargetChain.chainId(chainId).assetInfo(assetId);
          if (assetInfo) {
            setState({
              assetInfo,
              enabled: true,
            });
          }
        }
      }
    }, !!wallet);

    const handleCancel = () => {
      if (isImportFlow) {
        // In import flow, Cancel should remove the token config
        if (wallet) {
          tokensStore.removeTokenConfig({
            address: wallet.userEntryAddress,
            assetId,
          });
          viewingKeysStore.removeViewingKey({
            address: wallet.userEntryAddress,
            assetId,
          });
        }
      }
      router.back();
    };

    if (!wallet) return null;

    return (
      <div className="w-full">
        <Box className="w-full">
          <div className="my-4 flex-1 text-center text-white">
            {isImportFlow ? "Confirm Asset" : "Edit Asset"}
          </div>
          <div className="my-4">
            <label className="text-sm text-white">Token ID</label>
            <Input
              className="mt-2 px-3 py-3 text-sm"
              disabled
              value={assetId}
            />
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
          <div className="mb-4 mt-0.5 flex gap-4 text-white">
            {!isImportFlow && (
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
                variant="warning"
                className="w-1/3 justify-center rounded-lg p-2"
              >
                Remove
              </Button>
            )}
            <Button
              onClick={handleCancel}
              variant="secondary"
              className={cn(
                "justify-center rounded-lg p-2",
                isImportFlow ? "w-1/2" : "w-1/3",
              )}
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
              className={cn(
                "justify-center rounded-lg p-2",
                isImportFlow ? "w-1/2" : "w-1/3",
              )}
            >
              Save
            </AsyncButton>
          </div>
        </Box>
      </div>
    );
  },
);
