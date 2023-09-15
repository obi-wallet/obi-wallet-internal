import { AbstractWalletsSdk } from "./abstract";
import { CosmosSdkWalletsSdk } from "./cosmos-sdk";
import { LegacyCosmosWalletsSdk } from "./legacy-cosmos";
import { SecretJsWalletsSdk } from "./secret-js";
import { Chain } from "../../chains";
import { MultisigKey } from "../../data-structures";
import { AbstractUserInteractionResponse } from "../../user-interactions/abstract";
import { BroadcastTransactionResult } from "../common";

export { AbstractWalletsSdk };

export class WalletsSdk extends AbstractWalletsSdk {
  public async createWallet({
    multisigKey,
    demoMode,
  }: {
    multisigKey: MultisigKey;
    demoMode: boolean;
  }): Promise<
    | { homeAccountAddress: string }
    | AbstractUserInteractionResponse<
        { proxyAddress: string },
        { description: string; originalPayload: BroadcastTransactionResult }
      >
  > {
    return await Chain.select<AbstractWalletsSdk>({
      chainId: multisigKey.chainId,
      onCosmosChain(_) {
        return new CosmosSdkWalletsSdk();
      },
      onLegacyCosmosChain() {
        return new LegacyCosmosWalletsSdk();
      },
      onSecretJsChain() {
        return new SecretJsWalletsSdk();
      },
      onTerraChain() {
        return new CosmosSdkWalletsSdk();
      },
    }).createWallet({
      multisigKey,
      demoMode,
    });
  }
}
