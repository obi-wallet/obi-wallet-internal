import { AbstractMultisigWalletSdk } from "./abstract";
import { CosmosSdkMultisigWalletSdk } from "./cosmos-sdk";
import { LegacyCosmosMultisigWalletSdk } from "./legacy-cosmos";
import { Chain } from "../../chains";
import { CosmJsClient, FeatherJsClient } from "../../clients";
import { MultisigWallet } from "../../data-structures";

export { AbstractMultisigWalletSdk };

export class MultisigWalletSdk {
  public static wallet(wallet: MultisigWallet) {
    return Chain.select<AbstractMultisigWalletSdk>({
      chainId: wallet.chainId,
      onCosmosChain({ chainId }) {
        return new CosmosSdkMultisigWalletSdk({
          chainId,
          wallet,
          client: new CosmJsClient(chainId),
        });
      },
      onLegacyCosmosChain({ chainId }) {
        return new LegacyCosmosMultisigWalletSdk({ chainId, wallet });
      },
      onSecretJsChain() {
        // TODO:
        throw new Error("SecretJS does not support multisig wallets");
      },
      onTerraChain({ chainId }) {
        return new CosmosSdkMultisigWalletSdk({
          chainId,
          wallet,
          client: new FeatherJsClient(chainId),
        });
      },
    });
  }
}
