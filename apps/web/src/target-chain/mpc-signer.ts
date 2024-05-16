import { IntentionsPayload } from "@/keys/intentions-handler";
import { EasyShareDecryption } from "@/lib/encryption";
import { rootStore } from "@/stores";
import { IntentionsResults } from "@/user-interactions/approve-intentions";
import { Encoding, HexEncodedString } from "@obi-wallet/encoding";
import { MpcWallet, SecretJsClient } from "@obi-wallet/sdk";
import invariant from "tiny-invariant";
import { z } from "zod";

export const MpcSignature = z.object({
  r: HexEncodedString,
  s: HexEncodedString,
  recid: z.literal(0).or(z.literal(1)),
});

export class MpcSigner {
  protected bytesSignedBySignersPerHash = new Map<
    HexEncodedString,
    HexEncodedString[]
  >();
  protected lastHash: Uint8Array | undefined;

  public constructor(protected wallet: MpcWallet) {}

  public addIntentionsResults({
    payload,
    results,
  }: {
    payload: IntentionsPayload;
    results: IntentionsResults;
  }) {
    payload.signHashes.forEach((hash, index) => {
      this.bytesSignedBySignersPerHash.set(
        Encoding.fromBytes(hash).toHex(),
        [...results.values()]
          .map((result) => {
            return result.signedHashes[index];
          })
          .filter((signedHash): signedHash is Uint8Array => {
            return !!signedHash;
          })
          .map((signedHash) => {
            return Encoding.fromBytes(signedHash).toHex();
          }),
      );
    });
  }

  public async signHash(hash: Uint8Array) {
    this.lastHash = hash;
    if (this.wallet.encryptedEasyShare) {
      return await this.signHashWithEasyShare(hash);
    }

    throw new Error("No encrypted easy share found");
  }

  public async calculateHashToSign(f: () => Promise<void>) {
    try {
      // This will fail, but we are able to retrieve the hash that needs to be signed
      await f();
    } catch (e) {
      // Ignoring errors
    }
    return this.lastHash;
  }

  protected async signHashWithEasyShare(hash: Uint8Array) {
    invariant(rootStore.current, "Root store is not initialized");

    const bytes = Encoding.fromBytes(hash).toHex();
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

    return await client.queryContract({
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
      schema: MpcSignature,
    });
  }
}
