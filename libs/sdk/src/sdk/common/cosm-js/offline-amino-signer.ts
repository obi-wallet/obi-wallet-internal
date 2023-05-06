import {
  AccountData,
  AminoSignResponse,
  encodeSecp256k1Signature,
  OfflineAminoSigner as AbstractOfflineAminoSigner,
  pubkeyToAddress,
  serializeSignDoc,
  StdSignDoc,
} from "@cosmjs/amino";
import { Sha256 } from "@cosmjs/crypto";

import { Signer } from "../../../signers";

export class CosmJsOfflineAminoSigner implements AbstractOfflineAminoSigner {
  protected constructor(protected signer: Signer, protected prefix: string) {}

  public static fromSigner({
    signer,
    prefix,
  }: {
    signer: Signer;
    prefix: string;
  }) {
    return new CosmJsOfflineAminoSigner(signer, prefix);
  }

  public get address(): string {
    return pubkeyToAddress(this.signer.publicKey, this.prefix);
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
    signDoc: StdSignDoc
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

  public async signStdSignDoc(signDoc: StdSignDoc) {
    const hash = new Sha256(serializeSignDoc(signDoc)).digest();
    return await this.signer.signHash(hash);
  }
}
