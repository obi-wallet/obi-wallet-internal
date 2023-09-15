import { MultisigKey } from "../../../data-structures";
import { AbstractWalletsSdk } from "../abstract";

export class CosmosSdkWalletsSdk extends AbstractWalletsSdk {
  public async createWallet({
    multisigKey,
    demoMode,
  }: {
    multisigKey: MultisigKey;
    demoMode: boolean;
  }): Promise<
    | { homeAccountAddress: string }
  > {
    const _unused = { multisigKey, demoMode };
    throw new Error("not implemented for cosmos sdk");
  }
}
