import { AbstractMultisigWalletSdk } from "./abstract";
import { SecretJsMultisigWalletSdk } from "./secret-js";
import { Chain } from "../../chains";
import { MultisigWallet } from "../../data-structures";

export { AbstractMultisigWalletSdk };

export class MultisigWalletSdk {
  public static wallet(wallet: MultisigWallet) {
    return Chain.select<AbstractMultisigWalletSdk>({
      /*({ chainId }) {
        return new CosmosSdkMultisigWalletSdk({
          chainId,
          wallet,
          client: new CosmJsClient(chainId),
        });
      },
      onLegacyCosmosChain({ chainId }) {
        return new LegacyCosmosMultisigWalletSdk({ chainId, wallet });
      },*/
      onSecretJsChain({ chainId }) {
        return new SecretJsMultisigWalletSdk({ chainId, wallet });
      },
      /*onTerraChain({ chainId }) {
        return new CosmosSdkMultisigWalletSdk({
          chainId,
          wallet,
          client: new FeatherJsClient(chainId),
        });
      },*/
    });
  }
}
