import {
  secretJsChains,
  SecretJsClient,
  Signer as SdkSigner,
  Secp256k1PrivateKeySigner,
} from "@obi-wallet/sdk";
import { ethers } from "ethers";
import secp256k1 from "secp256k1";

import { HomeChainWithId } from "./db/schema";

export class SecretJsSigner {
  protected homeChain: HomeChainWithId;
  protected client: SecretJsClient;
  protected zAuthSigner: SdkSigner;

  public constructor(homeChain: HomeChainWithId) {
    this.homeChain = homeChain;
    this.client = new SecretJsClient(homeChain.chainId);
    this.zAuthSigner = new Secp256k1PrivateKeySigner(
      homeChain.zAuthKeyPair.privateKey,
    );
  }

  protected get chainData() {
    return secretJsChains[this.homeChain.chainId];
  }

  public async getAddress(): Promise<string> {
    return ethers.computeAddress(await this.getPublicKey());
  }

  protected get publicKeyRaw() {
    return Buffer.from(this.homeChain.targetChain.publicKey.value, "base64");
  }

  public async getPublicKey(): Promise<string> {
    return `0x${Buffer.from(
      secp256k1.publicKeyConvert(this.publicKeyRaw, false),
    ).toString("hex")}`;
  }

  public async getCompressedPublicKey(): Promise<string> {
    return `0x${Buffer.from(
      secp256k1.publicKeyConvert(this.publicKeyRaw, true),
    ).toString("hex")}`;
  }

  public async signMessage(message: string | Uint8Array): Promise<string> {
    const messageToSign =
      typeof message === "string"
        ? Buffer.from(message, "utf-8")
        : Buffer.from(message);
    console.log({ messageToSign: messageToSign.toString("hex") });
    const signed = await this.zAuthSigner.sign(messageToSign);

    return await this.client.withSecretNetworkClient(async (client) => {
      console.log(
        JSON.stringify(
          {
            sign_bytes: {
              user_public_key: Buffer.from(
                this.homeChain.zAuthKeyPair.publicKey.value,
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
        contract_address: this.chainData.secretSigner.address,
        code_hash: this.chainData.secretSigner.codeHash,
        query: {
          sign_bytes: {
            user_public_key: Buffer.from(
              this.homeChain.zAuthKeyPair.publicKey.value,
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
