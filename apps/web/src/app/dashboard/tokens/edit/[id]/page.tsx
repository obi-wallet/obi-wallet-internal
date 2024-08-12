"use client";

import { Box, Button, Input } from "@/components";
import { useStore } from "@/contexts";
import { useAddressQuery } from "@/hooks/address";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { TargetChain } from "@/target-chain";
import { SecretChainId } from "@/target-chain/secret/chains";
import { SignAndBroadcastTransactionUserInteractionHandler } from "@/user-interactions/sign-and-broadcast-transaction-handler";
import {
  ChainId,
  SignAndBroadcastTransactionUserInteraction,
} from "@obi-wallet/sdk";
import { AssetInfo } from "@obi-wallet/sdk-abstract-target-chain";
import { Caip19AssetId, parseCaip19AssetId } from "@obi-wallet/sdk-caip";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEffectOnceWhen } from "rooks";
import { MsgExecuteContract } from "secretjs";

export default observer<{
  params: { id: Caip19AssetId };
}>(function TokenEdit({ params }) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const assetId = decodeURIComponent(params.id) as Caip19AssetId;
  const parts = assetId.split(":");
  const contract_address = parts[parts.length - 1];
  const chainId = assetId.split("/")[0] as SecretChainId.Secret;

  const { data: address } = useAddressQuery(chainId);
  console.log("wallet address", address);
  const wallet = useCurrentWallet({});
  const router = useRouter();
  const { tokensStore, viewingKeysStore } = useStore();

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

  const [secretTokenViewingKey, setSecretTokenViewingKey] =
    useState<string>("");
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
        const { chainId } = parseCaip19AssetId(assetId);
        const assetInfo =
          await TargetChain.chainId(chainId).newAssetInfo(assetId);
        if (assetInfo) {
          setState({
            assetInfo,
            enabled: true,
          });
        }
      }
      const persistedViewingKey = viewingKeysStore.getViewingKey({
        address: wallet.userEntryAddress,
        assetId,
      });
      if (persistedViewingKey) {
        setSecretTokenViewingKey(persistedViewingKey);
      } else {
      }
    }
  }, !!wallet);

  if (!wallet) return null;

  return (
    <div className="w-full ">
      <Box className="w-full lg:w-1/2 ">
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
              router.back();
            }}
            className="flex-1 justify-center rounded-lg border-blue-500 bg-transparent p-2 text-center"
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              tokensStore.setTokenConfig({
                address: wallet.userEntryAddress,
                assetId,
                config: state,
              });

              if (contract_address && chainId && address) {
                const message = new MsgExecuteContract({
                  sender: address,
                  contract_address: contract_address,
                  msg: {
                    set_viewing_key: {
                      key: "sample viewing key",
                    },
                  },
                });

                const response =
                  await SignAndBroadcastTransactionUserInteraction.start({
                    messages: [message],
                    memo: "",
                    cancelable: true,
                    targetChainId: chainId,
                    walletMeta: {
                      userEntryAddress: wallet.userEntryAddress,
                    },
                  });

                if (response.approved) {
                  const broadcastResult = response.payload;
                  console.log("broadcastResult", broadcastResult);
                  if (broadcastResult.success) {
                    console.log("broadcast success");
                    viewingKeysStore.setViewingKey({
                      address: wallet.userEntryAddress,
                      assetId,
                      key: secretTokenViewingKey,
                    });
                  } else {
                    console.log("broadcast failed");
                  }
                }
              }

              router.back();
            }}
            className="flex-1 justify-center rounded-lg p-2"
          >
            Save
          </Button>
        </div>
      </Box>
    </div>
  );
});
