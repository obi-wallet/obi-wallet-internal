import { AbstractMultisigWalletSdk } from "./abstract";
import { CosmosMultisigWalletSdk } from "./cosmos/multisig-wallet";
import { TerraMultisigWalletSdk } from "./terra/multisig-wallet";
import { Chain, TerraChain } from "../chains";
import { MultisigWallet } from "../data-structures";

export class MultisigWalletSdk {
  public static wallet(wallet: MultisigWallet) {
    return Chain.select<AbstractMultisigWalletSdk>({
      chainId: wallet.chainId,
      onLegacyCosmosChain(chainId) {
        return new CosmosMultisigWalletSdk({ chainId, wallet });
      },
      onTerraChain(chainId: TerraChain) {
        return new TerraMultisigWalletSdk({ chainId, wallet });
      },
    });
  }
}
