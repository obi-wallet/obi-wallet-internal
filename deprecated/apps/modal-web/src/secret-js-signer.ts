import {
  SecretJsChains,
  SecretJsClient,
  Signer as SdkSigner,
  Secp256k1PrivateKeySigner,
  Secp256k1KeyPair,
} from "@obi-wallet/sdk";
import { ethers } from "ethers";
import secp256k1 from "secp256k1";
import invariant from "tiny-invariant";

import { HomeChainWithId } from "./db/schema";

export class SecretJsSigner {
  protected homeChain: HomeChainWithId;
  protected client: SecretJsClient;
  protected zAuthSigner: SdkSigner;
  protected deviceKeySigner?: Secp256k1PrivateKeySigner;

  public constructor(homeChain: HomeChainWithId, deviceKey?: Secp256k1KeyPair) {
    this.homeChain = homeChain;
    this.client = new SecretJsClient(homeChain.chainId);
    this.zAuthSigner = new Secp256k1PrivateKeySigner(
      homeChain.zAuthKeyPair.privateKey,
    );
    if (deviceKey) {
      this.deviceKeySigner = new Secp256k1PrivateKeySigner(
        deviceKey.privateKey,
      );
    }
  }

  protected get chainData() {
    return SecretJsChains[this.homeChain.chainId];
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
    const signed = this.zAuthSigner
      ? await this.zAuthSigner.sign(messageToSign)
      : await this.deviceKeySigner?.sign(messageToSign);
    invariant(signed, "Signature unavailable");

    return await this.client.withSecretNetworkClient(async (client) => {
      let bufferSource;
      if (!this.homeChain.zAuthKeyPair.publicKey) {
        bufferSource = this.deviceKeySigner?.publicKey.value;
      } else {
        bufferSource = this.homeChain.zAuthKeyPair.publicKey.value;
      }
      invariant(bufferSource, "Public key unavailable");
      console.log(
        JSON.stringify(
          {
            sign_bytes: {
              user_entry_address: this.homeChain.proxyAddress,
              user_entry_code_hash: this.chainData.userEntry.codeHash,
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
            user_entry_address: this.homeChain.proxyAddress,
            user_entry_code_hash: this.chainData.userEntry.codeHash,
            bytes: messageToSign.toString("hex"),
            bytes_signed_by_upk: signed.toString("hex"),
          },
        },
      })) as { plain_signature: string; signature: string };
      return response.signature;
    });
  }
}
