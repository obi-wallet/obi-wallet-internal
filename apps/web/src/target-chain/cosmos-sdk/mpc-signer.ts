import { fetchPublicKey } from "@/hooks/use-public-key";
import { TargetChain } from "@/target-chain";
import { MpcSigner } from "@/target-chain/abstract-mpc-signer";
import { CosmosSdkChainId } from "@/target-chain/cosmos-sdk/chains";
import {
  AminoSignResponse,
  encodeSecp256k1Signature,
  OfflineAminoSigner,
  serializeSignDoc,
  StdSignature,
  StdSignDoc,
} from "@cosmjs/amino";
import { sha256 } from "@cosmjs/crypto";
import {
  AccountData,
  DirectSignResponse,
  makeSignBytes,
  OfflineDirectSigner,
} from "@cosmjs/proto-signing";
import { MpcWallet } from "@obi-wallet/sdk";
import {
  getSec256k1CompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";

export class CosmosSdkMpcSigner
  implements OfflineDirectSigner, OfflineAminoSigner
{
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
    protected targetChainId: CosmosSdkChainId,
  ) {
    this.mpcSigner = new MpcSigner(wallet);
  }

  public static async fromWallet(
    wallet: MpcWallet,
    targetChainId: CosmosSdkChainId,
  ): Promise<CosmosSdkMpcSigner> {
    const publicKey = await fetchPublicKey(wallet);

    return new CosmosSdkMpcSigner(wallet, publicKey, targetChainId);
  }

  public async getAccounts(): Promise<readonly AccountData[]> {
    return [
      {
        algo: "secp256k1",
        address: this.address,
        pubkey: getSec256k1CompressedPublicKey(this.publicKey),
      },
    ];
  }

  public async signDirect(
    address: string,
    signDoc: SignDoc,
  ): Promise<DirectSignResponse> {
    const signBytes = makeSignBytes(signDoc);
    const stdSignature = await this.signHash(address, sha256(signBytes));

    return {
      signed: signDoc,
      signature: stdSignature,
    };
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
    const signature = Buffer.from(
      response.r.padStart(64, "0") + response.s.padStart(64, "0"),
      "hex",
    );
    return encodeSecp256k1Signature(
      getSec256k1CompressedPublicKey(this.publicKey),
      signature,
    );
  }
}
