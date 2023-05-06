import { AbstractWalletsSdk } from "./abstract/wallets";
import { BroadcastTransactionResult } from "./common";
import { LegacyCosmosWalletsSdk } from "./legacy-cosmos/wallets";
import { TerraWalletsSdk } from "./terra/wallets";
import { Chain } from "../chains";
import { MultisigKey } from "../data-structures";
import { AbstractUserInteractionResponse } from "../user-interactions/abstract";

export class WalletsSdk extends AbstractWalletsSdk {
  public async createWallet({
    multisigKey,
    demoMode,
  }: {
    multisigKey: MultisigKey;
    demoMode: boolean;
  }): Promise<
    AbstractUserInteractionResponse<
      { proxyAddress: string },
      {
        description: string;
        originalPayload: BroadcastTransactionResult;
      }
    >
  > {
    return await Chain.select<AbstractWalletsSdk>({
      chainId: multisigKey.chainId,
      onCosmosChain(_) {
        // TODO:
        throw new Error("WalletsSdk not implemented for Cosmos");
      },
      onLegacyCosmosChain() {
        return new LegacyCosmosWalletsSdk();
      },
      onTerraChain() {
        return new TerraWalletsSdk();
      },
    }).createWallet({
      multisigKey,
      demoMode,
    });
  }
}
