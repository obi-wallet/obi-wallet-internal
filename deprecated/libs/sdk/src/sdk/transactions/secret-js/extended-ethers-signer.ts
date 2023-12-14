import { Wallet, BytesLike, providers } from "ethers5";

import { SecretJsChainIds, SecretJsChains } from "../../../chains";
import { SecretJsClient } from "../../../clients";
import { MultisigKey } from "../../../data-structures";
import { Secp256k1PrivateKeySigner } from "../../../signers";
import { KeyType } from "../../wallets/secret-js-msig/types";

export class ExtendedWallet extends Wallet {
  public override provider!: providers.JsonRpcProvider;
  private readonly signingAddress: string;
  private readonly multisigKey: MultisigKey;
  private readonly userEntryAddress: string;

  constructor(
    address: string,
    provider: providers.JsonRpcProvider,
    multisigKey: MultisigKey,
    userEntryAddress: string,
  ) {
    // private key shouldn't matter here!
    super(
      "0x24910d6d60b1e4f49dc979d4eb9963317cf2f11bfdc4c4f220fd4cf9ca6e6e9f",
      provider,
    );
    this.signingAddress = address;
    this.multisigKey = multisigKey;
    this.userEntryAddress = userEntryAddress;
  }

  override async getAddress(): Promise<string> {
    return this.signingAddress;
  }

  override async signMessage(message: BytesLike): Promise<string> {
    const toHexString = (bytes: BytesLike): string | null => {
      if (bytes instanceof Uint8Array) {
        return Array.from(bytes)
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join("");
      } else if (bytes instanceof Buffer) {
        return bytes.toString("hex");
      } else if (bytes instanceof ArrayBuffer) {
        return toHexString(new Uint8Array(bytes));
      }
      return null;
    };
    const messageString = toHexString(message) ?? (message as string);
    console.log(
      "calling override signMessage() with message: " +
        (messageString ?? message),
    );

    // calling interactions here results in several, so we are temporarily using device key
    // directly to ask for signature
    const chain = SecretJsChains[SecretJsChainIds.MAINNET];
    let deviceKeySigner;
    if (
      this.multisigKey.getUsableKeyOfType(KeyType.Device)?.payload.privateKey
    ) {
      /* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
      deviceKeySigner = new Secp256k1PrivateKeySigner(
        this.multisigKey.getUsableKeyOfType(KeyType.Device)?.payload
          .privateKey!,
      );
    } else if (
      this.multisigKey.getUsableKeyOfType(KeyType.Unity)?.payload.privateKey
    ) {
      /* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
      deviceKeySigner = new Secp256k1PrivateKeySigner(
        this.multisigKey.getUsableKeyOfType(KeyType.Unity)?.payload.privateKey!,
      );
    } else {
      throw new Error("Device signer required for 4337 user operations");
    }
    const signature = await deviceKeySigner.signHash(
      Buffer.from(messageString, "hex"),
    );
    console.log("calling in secret client...");
    const signerSignature = await new SecretJsClient(
      SecretJsChainIds.MAINNET,
    ).withSecretNetworkClient(async (client) => {
      const sign_bytes_query_msg = {
        contract_address: chain.secretSigner.address,
        code_hash: chain.secretSigner.codeHash,
        query: {
          sign_bytes: {
            user_entry_address: this.userEntryAddress,
            user_entry_code_hash: chain.userEntry.codeHash,
            bytes: messageString,
            bytes_signed_by_signers: [Buffer.from(signature).toString("hex")],
          },
        },
      };
      console.log(
        "sign_bytes_query_msg: " + JSON.stringify(sign_bytes_query_msg),
      );
      const response = (await client.query.compute.queryContract(
        sign_bytes_query_msg,
      )) as { signature: string };
      console.log("signer contract response: " + JSON.stringify(response));
      return response.signature;
    });
    console.log("secret client done.");

    // const interactionObj = {
    //   messages: [{ raw: messageString ?? message }],
    //   demoMode: false,
    //   cancelable: false,
    //   /* walletMeta: {
    //     walletId: "secret-signer",
    //     currentAccount: null
    //   }, */
    //   multisigKey: this.multisigKey,
    //   userEntryAddress: this.userEntryAddress,
    // };
    // console.log(
    //   "interaction object inside ExtendedWallet is: " +
    //     JSON.stringify(interactionObj),
    // );
    // const res =
    //   await SignAndBroadcastTransactionUserInteraction.start(interactionObj);
    // console.log("obtained ExtendedWallet response: " + JSON.stringify(signerSignature));
    // /* eslint-disable @typescript-eslint/no-explicit-any */
    // invariant((res as any).payload?.transactionHash, "No signature obtained");
    // /* eslint-disable @typescript-eslint/no-explicit-any */
    // return (res as any).payload?.transactionHash;
    console.log(
      "obtained ExtendedWallet signature: " + JSON.stringify(signerSignature),
    );
    return signerSignature;
  }
}
