import { HomeChain } from "@/home-chain";
import { TargetChain } from "@/target-chain";
import { MpcSigner } from "@/target-chain/mpc-signer";
import { SecretChainId } from "@/target-chain/secret/chains";
import {
  AminoSignResponse,
  encodeSecp256k1Signature,
  serializeSignDoc,
  StdSignature,
  StdSignDoc,
} from "@cosmjs/amino";
import { sha256 } from "@cosmjs/crypto";
import { AccountData } from "@cosmjs/proto-signing";
import { Encoding, HexEncodedString } from "@obi-wallet/encoding";
import { MpcWallet } from "@obi-wallet/sdk";
import {
  getSecp256k1CompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import { AminoSigner } from "secretjs/dist/wallet_amino";

export class SecretMpcSigner implements AminoSigner {
  public readonly mpcSigner: MpcSigner;

  public get address(): string {
    return this.targetChain.computeAddress(this.publicKey);
  }

  protected get targetChain() {
    return TargetChain.chainId(this.targetChainId);
  }

  protected constructor(
    protected wallet: MpcWallet,
    protected publicKey: Secp256k1PublicKey,
    protected targetChainId: SecretChainId,
  ) {
    this.mpcSigner = new MpcSigner(wallet);
  }

  public static async fromWallet(
    wallet: MpcWallet,
    targetChainId: SecretChainId,
  ): Promise<SecretMpcSigner> {
    const publicKey = await HomeChain.chainId(
      wallet.homeChainId,
    ).secp256k1PublicKey(wallet.userEntryAddress);

    return new SecretMpcSigner(wallet, publicKey, targetChainId);
  }

  public async getAccounts(): Promise<readonly AccountData[]> {
    return [
      {
        algo: "secp256k1",
        address: this.address,
        pubkey: getSecp256k1CompressedPublicKey(this.publicKey),
      },
    ];
  }

  public async signAmino(
    address: string,
    signDoc: StdSignDoc,
  ): Promise<AminoSignResponse> {
    const signBytes = serializeSignDoc(signDoc);
    const stdSignature = await this.signHash(address, sha256(signBytes));

    return {
      signed: signDoc,
      signature: stdSignature,
    };
  }

  public async signHash(
    address: string,
    hash: Uint8Array,
  ): Promise<StdSignature> {
    if (address !== this.address) {
      throw new Error(`Address ${address} not found in wallet`);
    }
    const signature = await this.mpcSigner.signHash(hash);
    return this.encodeSignature(signature);
  }

  protected encodeSignature(response: { r: string; s: string }) {
    const r = HexEncodedString.parse(response.r.padStart(64, "0"));
    const s = HexEncodedString.parse(response.s.padStart(64, "0"));
    const signature = Encoding.concat(
      Encoding.fromHex(r),
      Encoding.fromHex(s),
    ).toBytes();
    return encodeSecp256k1Signature(
      getSecp256k1CompressedPublicKey(this.publicKey),
      signature,
    );
  }
}
