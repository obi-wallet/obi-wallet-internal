import { MultisigKey } from "../../../data-structures";
import { AbstractWalletsSdk } from "../abstract";

export class CosmosSdkWalletsSdk extends AbstractWalletsSdk {
  public async getAsyncDetailsAndFirstOwnerUpdate({
    multisigKey,
    demoMode,
  }: {
    multisigKey: MultisigKey;
    demoMode: boolean;
  }): Promise<{
    homeAccountAddress: string;
    signingPublicKey: string;
    evmSigningAddress: string;
    evmUserContractAddress: string;
  }> {
    const _unused = { multisigKey, demoMode };
    throw new Error("not implemented for cosmos sdk");
  }
}
