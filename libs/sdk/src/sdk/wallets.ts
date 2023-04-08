import { AbstractWalletsSdk } from "./abstract/wallets";
import { BroadcastTransactionResult } from "./common";
import { CosmosWalletsSdk } from "./cosmos/wallets";
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
      onCosmosChain() {
        return new CosmosWalletsSdk();
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
