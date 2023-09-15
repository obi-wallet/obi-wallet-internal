import { AbstractWalletsSdk } from "./abstract";
// import { CosmosSdkWalletsSdk } from "./cosmos-sdk";
// import { LegacyCosmosWalletsSdk } from "./legacy-cosmos";
// import { SecretJsWalletsSdk } from "./secret-js";
import { Chain } from "../../chains";
import { MultisigKey } from "../../data-structures";
import { SecretJsMsigWalletSdk } from "./secret-js-msig";

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
  > {
    return await Chain.select<AbstractWalletsSdk>({
      chainId: multisigKey.chainId,
      onCosmosChain(_) {
        throw new Error ("non-secret home accounts disabled");
      },
      onLegacyCosmosChain() {
        throw new Error ("non-secret home accounts disabled");
      },
      onSecretJsChain() {
        return new SecretJsMsigWalletSdk();
      },
      onTerraChain() {
        throw new Error ("non-secret home accounts disabled");
      },
    }).createWallet({
      multisigKey,
      demoMode,
    });
  }
}
