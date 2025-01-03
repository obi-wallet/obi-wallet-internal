import { encodeSecp256k1Signature, AccountData } from "@cosmjs/amino";
import { sha256 } from "@cosmjs/crypto";
import {
  DirectSignResponse,
  OfflineDirectSigner,
  makeSignBytes,
} from "@cosmjs/proto-signing";
import { Encoding } from "@obi-wallet/encoding";
import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { pubkeyToAddress } from "secretjs";

import { Signer } from "../../../signers";

export interface DirectSignerWithAddress extends OfflineDirectSigner {
  readonly address: string;
}

export class SecretJsDirectSigner implements DirectSignerWithAddress {
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
    return new SecretJsDirectSigner(signer, prefix);
  }

  public get address(): string {
    return pubkeyToAddress(this.publicKey, this.prefix);
  }

  protected get publicKey(): Uint8Array {
    return Encoding.fromBase64(this.signer.publicKey.value).toBytes();
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

  public async signDirect(
    address: string,
    signDoc: SignDoc,
  ): Promise<DirectSignResponse> {
    if (address !== this.address) {
      throw new Error(`Address ${address} not found in wallet`);
    }

    const messageHash = sha256(makeSignBytes(signDoc));
    const signature = await this.signer.signHash(messageHash);

    return {
      signed: signDoc,
      signature: encodeSecp256k1Signature(this.publicKey, signature),
    };
  }
}
