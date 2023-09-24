import { AbstractMultisigWalletSdk } from "./abstract";
import { CosmosSdkMultisigWalletSdk } from "./cosmos-sdk";
import { LegacyCosmosMultisigWalletSdk } from "./legacy-cosmos";
import { SecretJsMultisigWalletSdk } from "./secret-js";
import { Chain } from "../../chains";
import { CosmJsClient, FeatherJsClient } from "../../clients";
import { MultisigWallet } from "../../data-structures";

export { AbstractMultisigWalletSdk };

export class MultisigWalletSdk {
  public static wallet(wallet: MultisigWallet) {
    return Chain.select<AbstractMultisigWalletSdk>({
      chainId: wallet.chainId,
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
