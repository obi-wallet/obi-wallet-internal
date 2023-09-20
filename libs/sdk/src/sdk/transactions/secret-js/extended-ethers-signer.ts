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
  private userEntryAddress: string;

  constructor(
    address: string,
    provider: providers.JsonRpcProvider,
    multisigKey: MultisigKey,
    userEntryAddress: string,
  ) {
    // private key shouldn't matter here!
    super("0x24910d6d60b1e4f49dc979d4eb9963317cf2f11bfdc4c4f220fd4cf9ca6e6e9f", provider);
    this.signingAddress = address;
    this.multisigKey = multisigKey;
    this.userEntryAddress = userEntryAddress;
  }

  override async getAddress(): Promise<string> {
    return this.signingAddress;
  }

  override async signMessage(message: BytesLike, recovery1c?: boolean): Promise<string> {
    const toHexString = ((bytes: BytesLike): string | null => {
      if (bytes instanceof Uint8Array) {
          return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
      } else if (bytes instanceof Buffer) {
          return bytes.toString('hex');
      } else if (bytes instanceof ArrayBuffer) {
          return toHexString(new Uint8Array(bytes));
      }
      return null;
    });
    const messageString = toHexString(message);
    const interactionObj = {
      messages: [{ raw: messageString ?? message }],
      demoMode: false,
      cancelable: false,
      /* walletMeta: {
        walletId: "secret-signer",
        currentAccount: null
      }, */
      multisigKey: this.multisigKey,
      userEntryAddress: this.userEntryAddress,
    };
    console.log("interaction object inside ExtendedWallet is: " + JSON.stringify(interactionObj));
    const res =
      await SignAndBroadcastTransactionUserInteraction.start(interactionObj);
    console.log("obtained ExtendedWallet response: " + JSON.stringify(res));
    /* eslint-disable @typescript-eslint/no-explicit-any */
    invariant((res as any).payload?.transactionHash, "No signature obtained");
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return (res as any).payload?.transactionHash;
  }
}
