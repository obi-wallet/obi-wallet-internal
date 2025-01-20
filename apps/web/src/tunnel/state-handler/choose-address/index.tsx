"use client";

import { Text } from "@/components";
import { EffectStateDispatch } from "@/effect/effect-state";
import { useAlert } from "@/hooks/alert";
import { useAssets } from "@/hooks/assets";
import { genericSimulateRequest } from "@/tunnel/fast-travel-worker";
import { AsyncButton } from "@/ui/button";
import { Input } from "@/ui/input";
import { Effect } from "effect";
import { observer } from "mobx-react-lite";
import { useState } from "react";

import { WalletProviders } from "./wallet-providers";
import { ChooseAddressState, TunnelState } from "../../state";
import { ObiWallet, PhantomWallet } from "../../wallets";

export interface ChooseAddressProps {
  state: ChooseAddressState;
  dispatch: EffectStateDispatch<typeof TunnelState>;
}

export const ChooseAddress = observer<ChooseAddressProps>(
  function ChooseAddress({ state, dispatch }) {
    const [address, setAddress] = useState("");
    const [walletProviders, _] = useState(() => {
      return new WalletProviders(state.to.asset);
    });
    const alert = useAlert();

    const assets = useAssets([state.from.asset, state.to.asset]);
    const fromAsset = assets[state.from.asset];
    const toAsset = assets[state.to.asset];

    const confirmAddress = async ({
      address,
      type,
    }: {
      address: string;
      type?: "obi" | "phantom";
    }) => {
      const response = await Effect.runPromise(
        genericSimulateRequest({
          from: {
            asset: state.from.asset,
            rawAmount: state.from.rawAmount,
          },
          to: {
            asset: state.to.asset,
            address,
            // TODO: get public key from address where possible (e.g., connected by wallet)
            publicKey: "AkDYMk/Avmkc8tFcfGOKOfFxETF0/g2v6IEg/Z1NnKLr",
          },
          slippage: "5",
          simulateOnly: false,
        }),
      );
      if (response.depositAddress) {
        await dispatch(
          state.setAddress({
            fromAddress: response.depositAddress,
            toAddress: address,
            walletType: type,
          }),
        );
      }
    };

    if (!fromAsset || !toAsset) {
      return null;
    }

    return (
      <div className="bg-background-main flex min-h-screen flex-col justify-center p-8 text-white">
        <Text size="xl" className="flex items-center gap-2">
          Receive {state.to.prettyAmount} $
          {toAsset.assetInfo?.symbol ?? toAsset.denom}
        </Text>
        <Text className="mt-4">
          <span className="align-middle leading-normal">
            Connect your wallet:
          </span>
        </Text>
        <PhantomWallet
          label="Connect Phantom"
          onClick={async () => {
            const res = await walletProviders.connectPhantom();
            if (res.success) {
              await confirmAddress({
                type: "phantom",
                address: res.address,
              });
            } else {
              alert.showError(res.error);
            }
          }}
        />
        <ObiWallet
          label="Connect Obi"
          onClick={async () => {
            const res = await walletProviders.connectObi();
            if (res.success) {
              await confirmAddress({
                type: "obi",
                address: res.address,
              });
            } else {
              alert.showError(res.error);
            }
          }}
        />
        <label>
          <Text className="mt-4">
            <span className="align-middle leading-normal">
              Or paste an address:
            </span>
          </Text>
          <Input
            labelClassname="bg-background-secondary"
            className="mt-2 h-[48px] w-full rounded-[5px] border border-[#32c9af]"
            placeholder="Paste your address here"
            value={address}
            onChange={(e) => {
              return setAddress(e);
            }}
          />
        </label>
        <AsyncButton
          className="mt-2 w-full"
          variant="secondary"
          disabled={!walletProviders.targetChain.validateAddress(address)}
          onClick={async () => {
            await confirmAddress({
              address,
            });
          }}
        >
          Continue
        </AsyncButton>
      </div>
    );
  },
);
