import {
  Key,
  KeyType,
  Secp256k1PublicKey,
  SecretJsChainId,
  secretJsChains,
  SecretJsClient,
  Signer as SdkSigner,
  ZAuthKeySigner,
} from "@obi-wallet/sdk";
import { ethers } from "ethers";
import secp256k1 from "secp256k1";

export class SecretJsSigner {
  protected chain: (typeof secretJsChains)[SecretJsChainId];
  protected client: SecretJsClient;
  protected publicKey: Secp256k1PublicKey;
  protected signer: SdkSigner;

  public constructor({
    chainId,
    publicKey,
  }: {
    chainId: SecretJsChainId;
    publicKey: Secp256k1PublicKey;
  }) {
    this.chain = secretJsChains[chainId];
    this.publicKey = publicKey;
    this.client = new SecretJsClient(chainId);
    const key = Key.create({
      type: KeyType.ZAuth as const,
      payload: {
        publicKey: this.publicKey,
      },
    });
    // @ts-expect-error this should be fine
    this.signer = new ZAuthKeySigner(key);
  }

  public async getAddress(): Promise<string> {
    return ethers.computeAddress(await this.getPublicKey());
  }

  public async getPublicKey(): Promise<string> {
    const ethPublicKey = await this.client.withSecretNetworkClient(
      async (client) => {
        const response = (await client.query.compute.queryContract({
          contract_address: this.chain.secretSigner.address,
          code_hash: this.chain.secretSigner.codeHash,
          query: {
            eth_pubkey: {
              user_public_key: Buffer.from(
                this.publicKey.value,
                "base64",
              ).toString("hex"),
            },
          },
        })) as { eth_pubkey: string };
        return response.eth_pubkey;
      },
    );
    return `0x${ethPublicKey}`;
  }

  public async getCompressedPublicKey(): Promise<string> {
    const pubKeyRaw = new Uint8Array(
      Buffer.from((await this.getPublicKey()).slice(2), "hex"),
    );
    return `0x${new Buffer(
      secp256k1.publicKeyConvert(pubKeyRaw, true),
    ).toString("hex")}`;
  }

  public async signMessage(message: string | Uint8Array): Promise<string> {
    const messageToSign =
      typeof message === "string"
        ? Buffer.from(message, "utf-8")
        : new Buffer(message);
    console.log({ messageToSign: messageToSign.toString("hex") });
    const signed = await this.signer.sign(messageToSign);

    return await this.client.withSecretNetworkClient(async (client) => {
      console.log(
        JSON.stringify(
          {
            sign_bytes: {
              user_public_key: Buffer.from(
                this.publicKey.value,
                "base64",
              ).toString("hex"),
              bytes: messageToSign.toString("hex"),
              bytes_signed_by_upk: signed.toString("hex"),
            },
          },
          null,
          2,
        ),
      );

      const response = (await client.query.compute.queryContract({
        contract_address: this.chain.secretSigner.address,
        code_hash: this.chain.secretSigner.codeHash,
        query: {
          sign_bytes: {
            user_public_key: Buffer.from(
              this.publicKey.value,
              "base64",
            ).toString("hex"),
            bytes: messageToSign.toString("hex"),
            bytes_signed_by_upk: signed.toString("hex"),
          },
        },
      })) as { plain_signature: string; signature: string };
      return response.signature;
    });
  }
}
