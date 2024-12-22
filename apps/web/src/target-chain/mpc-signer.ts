import { IntentionsPayload } from "@/keys/intentions-handler";
import { rootStore } from "@/stores";
import {
  handleEncryptedBackupShare,
  handleEncryptedEasyShare,
  IntentionsResults,
} from "@/user-interactions/approve-intentions/utils";
import { Encoding, HexEncodedString } from "@obi-wallet/encoding";
import {
  BackupShare,
  EasyShare,
  MpcWallet,
  SecretJsClient,
} from "@obi-wallet/sdk";
import { serialize } from "@obi-wallet/sdk-json";
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
  protected backupShare: BackupShare | undefined;
  protected easyShare: EasyShare | undefined;
  protected lastHash: Uint8Array | undefined;

  public constructor(protected wallet: MpcWallet) {}

  public async addIntentionsResults({
    payload,
    results,
  }: {
    payload: IntentionsPayload;
    results: IntentionsResults;
  }) {
    if (payload.decryptShares?.easy) {
      this.easyShare = await handleEncryptedEasyShare({
        multisigKey: this.wallet.owner,
        encryptedEasyShare: payload.decryptShares.easy,
        results,
      });
    }

    if (payload.decryptShares?.backup) {
      this.backupShare = await handleEncryptedBackupShare({
        multisigKey: this.wallet.owner,
        encryptedBackupShare: payload.decryptShares.backup,
        results,
      });
    }

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

    if (this.wallet.userEntryAddress) {
      if (!this.easyShare) {
        throw new Error("Cannot sign using contract without easy share");
      }

      try {
        return await this.signHashUsingContract(hash);
      } catch (e) {
        console.log("Failed to sign using contract, trying backup share", e);
        if (!this.backupShare) {
          throw new Error(
            "Cannot sign using backup share without backup share",
          );
        }
        return await this.signHashUsingBackupShare(hash);
      }
    } else {
      if (!this.easyShare || !this.backupShare) {
        throw new Error(
          "Cannot sign using backup share without easy and backup shares",
        );
      }
      return await this.signHashUsingBackupShare(hash);
    }
  }

  public async calculateHashToSign(f: () => Promise<void>) {
    let error;
    try {
      // This will fail, but we are able to retrieve the hash that needs to be signed
      await f();
    } catch (e) {
      // Don't throw the error yet
      error = e;
    }
    if (!this.lastHash) {
      // We could not retrieve the hash, so propagate the error
      throw error;
    }
    return this.lastHash;
  }

  protected async signHashUsingContract(hash: Uint8Array) {
    invariant(rootStore.current, "Root store is not initialized");
    invariant(this.easyShare, "No easy share found");
    const userEntryAddress = this.wallet.userEntryAddress;
    invariant(userEntryAddress, "No user entry address found");

    const bytes = Encoding.fromBytes(hash).toHex();
    const bytesSignedBySigners = this.bytesSignedBySignersPerHash.get(bytes);
    invariant(
      bytesSignedBySigners,
      `Hash ${bytes} has not been signed, but ${serialize([...this.bytesSignedBySignersPerHash.keys()])} have`,
    );

    const mpcPackage = await rootStore.current.wasmStore.getMpcEcdsaWasm();

    const signers = mpcPackage.createSigners([
      this.easyShare.preSignForNetworkShare,
    ]);

    const partialSignatures = signers.map((signer) => {
      return signer.partial(hash).scalar;
    });

    const client = new SecretJsClient(this.wallet.homeChainId);

    const userEntryCodeHash = await client.withSecretNetworkClient(
      async (secretNetworkClient) => {
        const info = await secretNetworkClient.query.compute.contractInfo({
          contract_address: userEntryAddress,
        });
        const response =
          await secretNetworkClient.query.compute.codeHashByCodeId({
            ...(info.contract_info?.code_id
              ? { code_id: info.contract_info.code_id }
              : {}),
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

  protected async signHashUsingBackupShare(hash: Uint8Array) {
    invariant(rootStore.current, "Root store is not initialized");
    invariant(this.easyShare, "No easy share found");
    invariant(this.backupShare, "No backup share found");

    const bytes = Encoding.fromBytes(hash).toHex();
    const bytesSignedBySigners = this.bytesSignedBySignersPerHash.get(bytes);
    invariant(
      bytesSignedBySigners,
      `Hash ${bytes} has not been signed, but ${serialize([...this.bytesSignedBySignersPerHash.keys()])} have`,
    );

    const mpcPackage = await rootStore.current.wasmStore.getMpcEcdsaWasm();

    const signers = mpcPackage.createSigners([
      this.easyShare.preSignForBackupShare,
      this.backupShare,
    ]);

    const partialSignatures = signers.map((signer) => {
      return signer.partial(hash);
    });

    const finalSignature = signers[1].create([partialSignatures[0]]);
    return MpcSignature.parse({
      r: finalSignature.signature.r.scalar,
      s: finalSignature.signature.s.scalar,
      recid: finalSignature.signature.recid,
    });
  }
}
