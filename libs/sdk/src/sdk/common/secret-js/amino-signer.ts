import {
  // AminoSignResponse,
  encodeSecp256k1Signature,
  // serializeSignDoc,
} from "@cosmjs/amino";
import { Sha256 } from "@cosmjs/crypto";
import { pubkeyToAddress, toUtf8 } from "secretjs";
import {
  AccountData,
  AminoSignResponse,
  AminoSigner,
  StdSignDoc,
} from "secretjs/dist/wallet_amino";

import { Signer } from "../../../signers";

export interface AminoSignerWithAddress extends AminoSigner {
  readonly address: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sortObject(obj: any): any {
  console.log("attempting to sortObject: " + JSON.stringify(obj));
  if (typeof obj !== "object" || obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObject);
  }
  const sortedKeys = Object.keys(obj).sort();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {};
  // NOTE: Use forEach instead of reduce for performance with large objects eg Wasm code
  sortedKeys.forEach((key) => {
    console.log("Sorting key:", key);
    if (key === "msgs") {
      console.log("Processing msgs array of length:", obj[key].length);
    }
    result[key] = sortObject(obj[key]);
  });
  console.log("sort result: " + JSON.stringify(result));
  return result;
}

export class SecretJsAminoSigner implements AminoSignerWithAddress {
  protected constructor(
    protected signer: Signer,
    protected prefix: string,
  ) {}

  public static fromSigner({
    signer,
    prefix,
  }: {
    signer: Signer;
    prefix: string;
  }) {
    return new SecretJsAminoSigner(signer, prefix);
  }

  public get address(): string {
    return pubkeyToAddress(this.publicKey, this.prefix);
  }

  protected get publicKey(): Uint8Array {
    return new Uint8Array(Buffer.from(this.signer.publicKey.value, "base64"));
  }

  public async getAccounts(): Promise<readonly AccountData[]> {
    return [
      {
        algo: "secp256k1",
        address: this.address,
        pubkey: this.publicKey,
      },
    ];
  }

  public async signAmino(
    signerAddress: string,
    signDoc: StdSignDoc,
  ): Promise<AminoSignResponse> {
    if (signerAddress !== this.address) {
      throw new Error(`Address ${signerAddress} not found in wallet`);
    }

    const signature = await this.signStdSignDoc(signDoc);

    return {
      signed: signDoc,
      signature: encodeSecp256k1Signature(this.publicKey, signature),
    };
  }

  /// Signs a message after hashing it. Note that this does not add
  /// any "Ethereum signed message" prefix since the function is unaware
  /// of whether the context is Ethereum or not.
  public async signMessage(message: Uint8Array) {
    const hash = new Sha256(message).digest();
    return await this.signer.signHash(hash);
  }

  /** Returns a JSON string with objects sorted by key, used for Amino signing */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private jsonSortedStringify(obj: any): string {
    const sorted = sortObject(obj);
    return JSON.stringify(sorted);
  }

  public serializeSignDoc(signDoc: StdSignDoc): Uint8Array {
    console.log("serializing sign doc: " + JSON.stringify(signDoc));
    return toUtf8(this.jsonSortedStringify(signDoc));
  }

  public async signStdSignDoc(signDoc: StdSignDoc) {
    const serialized = this.serializeSignDoc(signDoc);
    console.log("serialized sign doc: " + Buffer.from(serialized).toString());
    const hash = new Sha256().digest();
    console.log("Serialized!");
    console.log("this signer is: " + JSON.stringify(this.signer));
    return await this.signer.signHash(hash);
  }
}
