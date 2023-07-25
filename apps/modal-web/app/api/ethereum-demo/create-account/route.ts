import { EthereumAccountWithPrivateKey } from "@obi-wallet/headless-ui";
import {
  generateSec256k1KeyPair,
  Key,
  KeyType,
  Secp256k1KeyPair,
  Secp256k1PublicKey,
  SecretJsChainId,
  secretJsChains,
  SecretJsClient,
  Signer as SdkSigner,
  ZAuthKeySigner,
} from "@obi-wallet/sdk";
import { ethers, Signer, SigningKey, Wallet } from "ethers";
import { NextResponse } from "next/server";
import secp256k1 from "secp256k1";
import { Presets } from "userop";

class SecretJsSigner {
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

  public async signMessage(message: string | Uint8Array): Promise<string> {
    const messageToSign =
      typeof message === "string"
        ? Buffer.from(message, "utf-8")
        : new Buffer(message);
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

const config = {
  rpcUrl: process.env.STACKUP_RPC_URL,
  paymaster: {
    rpcUrl: process.env.STACKUP_PAYMASTER_RPC_URL,
    context: { type: "payg" },
  },
};

export async function POST(request: Request) {
  const body = (await request.json()) as {
    publicKey: Secp256k1PublicKey;
    chainId: SecretJsChainId;
  };

  try {
    const account = await recoverEthereumAccount(body);
    return NextResponse.json(account);
  } catch (e) {
    console.log(e);
    const account = await generateEthereumAccount();
    return NextResponse.json(account);
  }
}

async function recoverEthereumAccount({
  publicKey,
  chainId,
}: {
  publicKey: Secp256k1PublicKey;
  chainId: SecretJsChainId;
}) {
  const signer = new SecretJsSigner({
    chainId,
    publicKey,
  });
  // @ts-expect-error this should be fine
  const address = await generateEthereumAddressFromSigner(signer);
  const pubKeyRaw = new Uint8Array(
    Buffer.from((await signer.getPublicKey()).slice(2), "hex"),
  );
  const compressed = secp256k1.publicKeyConvert(pubKeyRaw, true);

  return {
    keyPair: {
      publicKey: {
        type: "tendermint/PubKeySecp256k1",
        value: new Buffer(compressed).toString("base64"),
      },
    },
    address,
  };
}

async function generateEthereumAccount(): Promise<EthereumAccountWithPrivateKey> {
  const keyPair = generateSec256k1KeyPair();
  const address = await generateEthereumAddress(keyPair);
  return {
    keyPair,
    address,
  };
}

async function generateEthereumAddress(keyPair: Secp256k1KeyPair) {
  const signingKey = new SigningKey(Buffer.from(keyPair.privateKey, "base64"));
  const signer: Signer = new Wallet(signingKey);
  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    // @ts-expect-error this should be fine
    signer,
    config.rpcUrl,
  );
  return simpleAccount.getSender();
}

async function generateEthereumAddressFromSigner(signer: Signer) {
  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    // @ts-expect-error this should be fine
    signer,
    config.rpcUrl,
  );
  return simpleAccount.getSender();
}
