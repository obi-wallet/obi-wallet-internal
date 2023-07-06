import { EthereumAccount } from "@obi-wallet/headless-ui";
import { generateSec256k1KeyPair, Secp256k1KeyPair } from "@obi-wallet/sdk";
import { Signer, SigningKey, Wallet } from "ethers";
import { NextResponse } from "next/server";
import { Presets } from "userop";

const config = {
  rpcUrl: process.env.STACKUP_RPC_URL,
  paymaster: {
    rpcUrl: process.env.STACKUP_PAYMASTER_RPC_URL,
    context: { type: "payg" },
  },
};

export async function POST(_: Request) {
  const account = await generateEthereumAccount();
  return NextResponse.json(account);
}

async function generateEthereumAccount(): Promise<EthereumAccount> {
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
    config.rpcUrl
  );
  return simpleAccount.getSender();
}
