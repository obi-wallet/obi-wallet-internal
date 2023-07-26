import { EthereumAccountWithPrivateKey } from "@obi-wallet/headless-ui";
import {
  generateSec256k1KeyPair,
  Secp256k1KeyPair,
  Secp256k1PublicKey,
  SecretJsChainId,
} from "@obi-wallet/sdk";
import { Signer, SigningKey, Wallet } from "ethers";
import { NextResponse } from "next/server";
import secp256k1 from "secp256k1";
import { Presets } from "userop";

import { SecretJsSigner } from "../../../../src/secret-js-signer";

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
