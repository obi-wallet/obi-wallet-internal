"use client";

import { Box, Button, Input } from "@/components";
import { useStore } from "@/contexts";
import { useAlert } from "@/hooks/alert";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { TargetChain } from "@/target-chain";
import { isSecretChainId } from "@/target-chain/secret/chains";
import { SecretMpcSigner } from "@/target-chain/secret/mpc-signer";
import { AsyncButton } from "@/ui/button";
import { Encoding } from "@obi-wallet/encoding";
import { SignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { AssetInfo } from "@obi-wallet/sdk-abstract-target-chain";
import { Caip19AssetId, parseCaip19AssetId } from "@obi-wallet/sdk-caip";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEffectOnceWhen } from "rooks";
import { MsgExecuteContract } from "secretjs";
import invariant from "tiny-invariant";

export default observer<{ params: { id: Caip19AssetId } }>(function TokenEdit({
  params,
}) {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const assetId = decodeURIComponent(params.id) as Caip19AssetId;
  const { chainId, reference } = parseCaip19AssetId(assetId);

  const wallet = useCurrentWallet({});
  const router = useRouter();
  const { tokensStore, viewingKeysStore } = useStore();
  const alert = useAlert();

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
              router.back();
            }}
            className="flex-1 justify-center rounded-lg border-blue-500 bg-transparent p-2 text-center"
          >
            Cancel
          </Button>
          <AsyncButton
            onClick={async () => {
              tokensStore.setTokenConfig({
                address: wallet.userEntryAddress,
                assetId,
                config: state,
              });

              if (reference && isSecretChainId(chainId)) {
                const signer = await SecretMpcSigner.fromWallet(
                  wallet,
                  chainId,
                );

                const accounts = await signer.getAccounts();
                const firstAccount = accounts[0];
                invariant(firstAccount, "No account found");

                const random = new Uint8Array(32);
                crypto.getRandomValues(random);
                const key = Encoding.fromBytes(random).toHex();
                const message = new MsgExecuteContract({
                  sender: firstAccount.address,
                  contract_address: reference,
                  msg: {
                    set_viewing_key: {
                      key,
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
                  if (broadcastResult.success) {
                    viewingKeysStore.setViewingKey({
                      address: wallet.userEntryAddress,
                      assetId,
                      key,
                    });
                    alert.showSuccess("TX broadcast successfully");
                  } else {
                    alert.showError(`TX failed: ${broadcastResult.rawLog}`);
                  }
                }
              }

              router.back();
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
