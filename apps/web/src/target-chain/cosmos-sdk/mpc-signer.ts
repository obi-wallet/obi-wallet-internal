import { rootStore } from "@/hooks/use-create-root-store";
import { fetchPublicKey } from "@/hooks/use-public-key";
import { IntentionsPayload } from "@/keys/intentions-handler";
import { EasyShareDecryption } from "@/lib/encryption";
import { TargetChain, TargetChainId } from "@/target-chain";
import { IntentionsResults } from "@/user-interactions/approve-intentions";
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
import { MpcWallet, SecretJsClient } from "@obi-wallet/sdk";
import {
  getSec256k1CompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import invariant from "tiny-invariant";
import { z } from "zod";

export class CosmosSdkMpcSigner
  implements OfflineDirectSigner, OfflineAminoSigner
{
  protected bytesSignedBySignersPerHash = new Map<string, string[]>();
  public lastHash: Uint8Array | undefined;

  public get address(): string {
    return this.targetChain.computeAddress(this.publicKey);
  }

  protected get targetChain() {
    return TargetChain.chainId(this.targetChainId);
  }

  protected constructor(
    protected wallet: MpcWallet,
    protected publicKey: Secp256k1PublicKey,
    protected targetChainId: TargetChainId,
  ) {}

  public static async fromWallet(
    wallet: MpcWallet,
    targetChainId: TargetChainId,
  ): Promise<CosmosSdkMpcSigner> {
    const publicKey = await fetchPublicKey(wallet);

    return new CosmosSdkMpcSigner(wallet, publicKey, targetChainId);
  }

  public addIntentionsResults({
    payload,
    results,
  }: {
    payload: IntentionsPayload;
    results: IntentionsResults;
  }) {
    payload.signHashes.forEach((hash, index) => {
      this.bytesSignedBySignersPerHash.set(
        Buffer.from(hash).toString("hex"),
        [...results.values()]
          .map((result) => {
            return result.signedHashes[index];
          })
          .filter((signedHash): signedHash is Uint8Array => {
            return !!signedHash;
          })
          .map((signedHash) => Buffer.from(signedHash).toString("hex")),
      );
    });
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

  protected async signHash(
    address: string,
    hash: Uint8Array,
  ): Promise<StdSignature> {
    this.lastHash = hash;
    if (this.wallet.encryptedEasyShare) {
      return await this.signHashWithEasyShare(address, hash);
    }

    throw new Error("No encrypted easy share found");
  }

  protected async signHashWithEasyShare(
    address: string,
    hash: Uint8Array,
  ): Promise<StdSignature> {
    invariant(rootStore.current, "Root store is not initialized");

    const bytes = Buffer.from(hash).toString("hex");
    const bytesSignedBySigners = this.bytesSignedBySignersPerHash.get(bytes);
    invariant(bytesSignedBySigners, "Hash has not been signed");

    const mpcPackage = await rootStore.current.wasmStore.getMpcEcdsaWasm();

    const primaryKey = this.wallet.owner.primaryKey;
    invariant(primaryKey, "No primary key found");

    const easyShare = await new EasyShareDecryption(this.wallet.owner).decrypt(
      this.wallet.encryptedEasyShare,
    );

    const signers = mpcPackage.createSigners([
      easyShare.preSignForNetworkShare,
    ]);

    if (address !== this.address) {
      throw new Error(`Address ${address} not found in wallet`);
    }

    const partialSignatures = signers.map((signer) => {
      return signer.partial(hash).scalar;
    });

    const client = new SecretJsClient(this.wallet.homeChainId);

    const userEntryCodeHash = await client.withSecretNetworkClient(
      async (secretNetworkClient) => {
        const info = await secretNetworkClient.query.compute.contractInfo({
          contract_address: this.wallet.userEntryAddress,
        });
        const response =
          await secretNetworkClient.query.compute.codeHashByCodeId({
            code_id: info.contract_info?.code_id,
          });
        return response.code_hash;
      },
    );

    const schema = z.object({
      r: z.string(),
      s: z.string(),
    });
    const response = await client.queryContract({
      contract: this.wallet.homeChain.secretSigner.address,
      codeHash: this.wallet.homeChain.secretSigner.codeHash,
      query: {
        sign_bytes: {
          participants: [1, 3],
          user_entry_address: this.wallet.userEntryAddress,
          user_entry_code_hash: userEntryCodeHash,
          other_partial_sigs: partialSignatures,
          prepend: false,
          is_already_hashed: true,
          bytes,
          bytes_signed_by_signers: bytesSignedBySigners,
        },
      },
      schema,
    });
    return this.encodeSignature(response);
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
