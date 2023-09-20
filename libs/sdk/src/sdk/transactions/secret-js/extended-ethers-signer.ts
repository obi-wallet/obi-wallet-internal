import { Wallet, BytesLike, utils } from "ethers5";
import { providers } from "ethers5";
import invariant from "tiny-invariant";

import { WalletMeta } from "../../../data-structures";
import { SignAndBroadcastTransactionUserInteraction } from "../../../user-interactions";

export class ExtendedWallet extends Wallet {
  public override provider: providers.JsonRpcProvider;
  private signingAddress: string;
  private walletMeta: WalletMeta;

  constructor(
    address: string,
    walletMeta: WalletMeta,
    provider: providers.JsonRpcProvider,
  ) {
    // we don't have a private key here!
    super(address, provider);
    this.signingAddress = address;
    this.provider = provider;
    this.walletMeta = walletMeta;
  }

  override async getAddress(): Promise<string> {
    return this.signingAddress;
  }

  override async signMessage(message: BytesLike): Promise<string> {
    invariant(this.walletMeta, "no wallet meta");
    const { signature } =
      await SignAndBroadcastTransactionUserInteraction.start({
        messages: [{ raw: message }],
        demoMode: false,
        cancelable: false,
        walletMeta: this.walletMeta,
      });
    invariant(signature, "No signature obtained");
    return utils.hexlify(signature);
  }
}
