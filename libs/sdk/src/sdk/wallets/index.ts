import { AbstractWalletsSdk } from "./abstract";
// import { CosmosSdkWalletsSdk } from "./cosmos-sdk";
// import { LegacyCosmosWalletsSdk } from "./legacy-cosmos";
// import { SecretJsWalletsSdk } from "./secret-js";
import { SecretJsMsigWalletSdk } from "./secret-js-msig";
import { Chain } from "../../chains";
import { MultisigKey } from "../../data-structures";
export { AbstractWalletsSdk };

export class WalletsSdk extends AbstractWalletsSdk {
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
    return await Chain.select<AbstractWalletsSdk>({
      /*(_) {
        throw new Error("non-secret home accounts disabled");
      },
      onLegacyCosmosChain() {
        throw new Error("non-secret home accounts disabled");
      },*/
      onSecretJsChain() {
        return new SecretJsMsigWalletSdk();
      },
      /*onTerraChain() {
        throw new Error("non-secret home accounts disabled");
      },*/
    }).getAsyncDetailsAndFirstOwnerUpdate({
      multisigKey,
      demoMode,
    });
  }
}
