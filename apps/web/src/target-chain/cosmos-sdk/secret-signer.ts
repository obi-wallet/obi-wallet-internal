import { fetchPublicKey } from "@/hooks/use-public-key";
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
  KeyType,
  MultisigWallet,
  Secp256k1PrivateKeySigner,
  SecretJsClient,
} from "@obi-wallet/sdk";
import { getSec256k1CompressedPublicKey } from "@obi-wallet/sdk-secp256k1";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import { SignDoc } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import invariant from "tiny-invariant";
import { z } from "zod";

export class CosmosSdkSecretSigner implements OfflineDirectSigner {
  protected get address(): string {
    return this.targetChain.computeAddress(this.publicKey);
  }

  protected get targetChain() {
    return TargetChain.chainId(this.targetChainId);
  }

  protected constructor(
    protected wallet: MultisigWallet,
    protected publicKey: Secp256k1PublicKey,
    protected targetChainId: TargetChainId,
  ) {}

  public static async fromWallet(
    wallet: MultisigWallet,
    targetChainId: TargetChainId,
  ): Promise<CosmosSdkSecretSigner> {
    const publicKey = await fetchPublicKey(wallet);
    return new CosmosSdkSecretSigner(wallet, publicKey, targetChainId);
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
    if (address !== this.address) {
      throw new Error(`Address ${address} not found in wallet`);
    }
    const hashedMessage = sha256(signBytes);
    const passkey = this.wallet.owner.getUsableKeyOfType(KeyType.Device);
    invariant(passkey, "No usable passkey found");
    const passkeySigner = new Secp256k1PrivateKeySigner(
      // TODO: typing, should either be always or never exist
      passkey.payload.privateKey!,
    );

    const client = new SecretJsClient(this.wallet.chainId);

    const schema = z.object({
      signature: z.string(),
    });
    const response = await client.queryContract({
      contract: this.wallet.chain.secretSigner.address,
      query: {
        sign_bytes: {
          user_entry_address: this.wallet.proxyAddress,
          bytes: Buffer.from(hashedMessage).toString("hex"),
          bytes_signed_by_signers: [
            Buffer.from(await passkeySigner.signHash(hashedMessage)).toString(
              "hex",
            ),
          ],
          prepend: false,
        },
      },
      schema,
    });
    const signature = Buffer.from(response.signature.slice(2, 130), "hex");
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
