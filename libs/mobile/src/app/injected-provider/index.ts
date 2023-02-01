import { EncodeObject } from "@cosmjs/proto-signing";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { Keplr } from "@keplr-wallet/provider";
import { BACKGROUND_PORT } from "@keplr-wallet/router";
import {
  isAnyMultisigWallet,
  isMultisigDemoWallet,
  MessageRequesterExternal,
  PricingTier,
  RequestObiCosmosSignAndBroadcastMsg,
  RequestObiInAppPurchaseMsg,
  WalletType,
} from "@obi-wallet/common";
import { useMemo } from "react";
import invariant from "tiny-invariant";

import { getRootStore } from "../../background/root-store";

class ConcreteKeplr extends Keplr {
  // noinspection JSUnusedGlobalSymbols
  public async obiSignAndBroadcast(
    address: string,
    messages: EncodeObject[]
  ): Promise<DeliverTxResponse> {
    const currentWallet = getRootStore().walletsStore.currentWallet;

    invariant(currentWallet, "Expected `currentWallet` to be defined.");

    if (currentWallet.type === WalletType.CosmosMultisig) {
      const msg = new RequestObiCosmosSignAndBroadcastMsg({
        multisigKey: isAnyMultisigWallet(currentWallet)
          ? currentWallet.owner.serialize()
          : null,
        demoMode: isMultisigDemoWallet(currentWallet),
        encodeObjects: messages,
        proxyAddress: isAnyMultisigWallet(currentWallet)
          ? currentWallet.proxyAddress.address
          : undefined,
      });
      return await this.requester.sendMessage(BACKGROUND_PORT, msg);
    }

    // TODO: handle terra multisig
    throw new Error("not implemented yet");
  }

  public async obiInAppPurchase(
    pricingTier: PricingTier,
    payload: {
      collectionAddress: string;
      amount: string;
    }
  ): Promise<{ success: boolean }> {
    const msg = new RequestObiInAppPurchaseMsg({
      pricingTier,
      payload,
    });
    return await this.requester.sendMessage(BACKGROUND_PORT, msg);
  }
}

export function useKeplr({ url }: { url: string }) {
  return useMemo(() => {
    return new ConcreteKeplr(
      "0.10.10",
      "core",
      new MessageRequesterExternal({
        url: url,
        origin: new URL(url).origin,
      })
    );
  }, [url]);
}
