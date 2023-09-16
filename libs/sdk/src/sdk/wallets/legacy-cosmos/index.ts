import { MultisigKey } from "../../../data-structures";
import { AbstractWalletsSdk } from "../abstract";

export class LegacyCosmosWalletsSdk extends AbstractWalletsSdk {
  public async createHomeWalletAndAddKey(_: {
    multisigKey: MultisigKey;
    demoMode: boolean;
  }): Promise<{ homeAccountAddress: string }> {
    throw new Error("createWallet not implemented for Cosmos");
  }
}
