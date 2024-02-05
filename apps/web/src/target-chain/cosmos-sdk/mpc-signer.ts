import { rootStore } from "@/hooks/use-create-root-store";
import { newFetchPublicKey } from "@/hooks/use-public-key";
import { Secp256k1Decryption } from "@/lib/encryption";
import { TargetChain, TargetChainId } from "@/target-chain";
import { encodeSecp256k1Signature } from "@cosmjs/amino";
import { sha256 } from "@cosmjs/crypto";
import {
  AccountData,
  DirectSignResponse,
  makeSignBytes,
  OfflineDirectSigner,
} from "@cosmjs/proto-signing";
import {
  EasyShare,
  KeyType,
  MpcWallet,
  Secp256k1PrivateKeySigner,
  SecretJsClient,
} from "@obi-wallet/sdk";
import {
  getSec256k1CompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import invariant from "tiny-invariant";
import { z } from "zod";

export class CosmosSdkMpcSigner implements OfflineDirectSigner {
  protected get address(): string {
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
    const publicKey = await newFetchPublicKey(wallet);

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
    invariant(rootStore.current, "Root store is not initialized");
    const mpcPackage = await rootStore.current.wasmStore.getMpcEcdsaWasm();

    const passkey = this.wallet.owner.getUsableKeyOfType(KeyType.Device);
    invariant(passkey, "No usable passkey found");

    const easyShare = EasyShare.parse(
      JSON.parse(
        await new Secp256k1Decryption(passkey.payload.privateKey!).decrypt(
          this.wallet.encryptedEasyShare,
        ),
      ),
    );

    const signers = mpcPackage.createSigners([
      easyShare.preSignForNetworkShare,
    ]);

    if (address !== this.address) {
      throw new Error(`Address ${address} not found in wallet`);
    }
    const hashedMessage = sha256(signBytes);

    const partialSignatures = signers.map((signer) => {
      return signer.partial(hashedMessage).scalar;
    });

    const passkeySigner = new Secp256k1PrivateKeySigner(
      // TODO: typing, should either be always or never exist
      passkey.payload.privateKey!,
    );

    const client = new SecretJsClient(this.wallet.homeChainId);

    const userEntryCodeHash = await client.withSecretNetworkClient(
      async (secretNetworkClient) => {
        const info = await secretNetworkClient.query.compute.contractInfo({
          contract_address: this.wallet.userEntryAddress,
        });
        const response =
          await secretNetworkClient.query.compute.codeHashByCodeId({
            // @ts-expect-error Secret Network SDK types are wrong
            code_id: info.contract_info.code_id,
          });
        return response.code_hash;
      },
    );

    const schema = z.object({
      r: z.string(),
      s: z.string(),
      recid: z.number(),
    });
    const response = await client.queryContract({
      contract: this.wallet.homeChain.secretSigner.address,
      query: {
        sign_bytes: {
          participants: [1, 3],
          user_entry_address: this.wallet.userEntryAddress,
          user_entry_code_hash: userEntryCodeHash,
          other_partial_sigs: partialSignatures,
          prepend: false,
          is_already_hashed: true,
          bytes: Buffer.from(hashedMessage).toString("hex"),
          bytes_signed_by_signers: [
            Buffer.from(await passkeySigner.signHash(hashedMessage)).toString(
              "hex",
            ),
          ],
        },
      },
      schema,
    });
    const signature = Buffer.from(
      response.r.padStart(64, "0") + response.s.padStart(64, "0"),
      "hex",
    );
    const stdSignature = encodeSecp256k1Signature(
      getSec256k1CompressedPublicKey(this.publicKey),
      signature,
    );
    return {
      signed: signDoc,
      signature: stdSignature,
    };
  }
}
