import {
  SecretJsChainId,
  secretJsChains,
  SecretJsClient,
  Signer as SdkSigner,
  Secp256k1KeyPair,
  Secp256k1PrivateKeySigner,
} from "@obi-wallet/sdk";
import { ethers } from "ethers";
import secp256k1 from "secp256k1";

export class SecretJsSigner {
  protected chain: (typeof secretJsChains)[SecretJsChainId];
  protected client: SecretJsClient;
  protected keyPair: Secp256k1KeyPair;
  protected signer: SdkSigner;

  public constructor({
    chainId,
    keyPair,
  }: {
    chainId: SecretJsChainId;
    keyPair: Secp256k1KeyPair;
  }) {
    this.chain = secretJsChains[chainId];
    this.keyPair = keyPair;
    this.client = new SecretJsClient(chainId);
    this.signer = new Secp256k1PrivateKeySigner(this.keyPair.privateKey);
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
                this.keyPair.publicKey.value,
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
                this.keyPair.publicKey.value,
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
              this.keyPair.publicKey.value,
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

  public async getFeeDetails(): Promise<{
    feePayAddress: string;
    feeDivisor: number;
  }> {
    return await this.client.withSecretNetworkClient(async (client) => {
      const response = (await client.query.compute.queryContract({
        contract_address: this.chain.feeManager.address,
        code_hash: this.chain.feeManager.codeHash,
        query: {
          fee_details: {
            chain_id: this.chain.feeManager.homeChainId,
          },
        },
      })) as { fee_pay_address: string; fee_divisor: number };
      return {
        feePayAddress: `0x${response.fee_pay_address}`,
        feeDivisor: response.fee_divisor,
      };
    });
  }
}
