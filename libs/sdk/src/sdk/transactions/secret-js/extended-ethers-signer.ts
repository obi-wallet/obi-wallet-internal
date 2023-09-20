import { Wallet, BytesLike, utils } from "ethers5";
import { providers } from "ethers5";
import { generateSec256k1KeyPair } from "libs/sdk/src/keys";
import invariant from "tiny-invariant";

import { MultisigKey, WalletMeta } from "../../../data-structures";
import { SignAndBroadcastTransactionUserInteraction } from "../../../user-interactions";

export class ExtendedWallet extends Wallet {
  public override provider: providers.JsonRpcProvider;
  private signingAddress: string;
  private multisigKey: MultisigKey;

  constructor(
    address: string,
    provider: providers.JsonRpcProvider,
    multisigKey: MultisigKey,
  ) {
    // private key shouldn't matter here!
    super("0x24910d6d60b1e4f49dc979d4eb9963317cf2f11bfdc4c4f220fd4cf9ca6e6e9f", provider);
    this.signingAddress = address;
    this.multisigKey = multisigKey;
  }

  override async getAddress(): Promise<string> {
    return this.signingAddress;
  }

  override async signMessage(message: BytesLike): Promise<string> {
    const interactionObj = {
      messages: [{ raw: message }],
      demoMode: false,
      cancelable: false,
      /* walletMeta: {
        walletId: "secret-signer",
        currentAccount: null
      }, */
      multisigKey: this.multisigKey,
    };
    console.log("interaction object inside ExtendedWallet is: " + JSON.stringify(interactionObj));
    const { signature } =
      await SignAndBroadcastTransactionUserInteraction.start(interactionObj);
    invariant(signature, "No signature obtained");
    return utils.hexlify(signature);
  }
}
