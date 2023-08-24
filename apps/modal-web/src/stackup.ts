import { EthereumAccount } from "@obi-wallet/headless-ui";
import {
  generateSec256k1KeyPair,
  Secp256k1KeyPair,
  Secp256k1PrivateKeySigner,
  Secp256k1PublicKey,
  secretJsChains,
  SecretJsClient,
} from "@obi-wallet/sdk";
import { Signer, SigningKey, Wallet } from "ethers";
import { MsgExecuteContract, Wallet as SecretJsWallet } from "secretjs";
import { Presets } from "userop";

import { HomeChainWithId } from "./db/schema";

const config = {
  rpcUrl: process.env.STACKUP_RPC_URL,
  paymaster: {
    rpcUrl: process.env.STACKUP_PAYMASTER_RPC_URL,
    context: { type: "payg" },
  },
};

export async function recoverOrCreateEthereumAccount(
  homeChain: HomeChainWithId,
) {
  try {
    return await recoverEthereumAccount(homeChain);
  } catch (e) {
    console.log(e);
    return await generateEthereumAccount(homeChain);
  }
}

async function recoverEthereumAccount({
  targetChain,
}: HomeChainWithId): Promise<{
  publicKey: Secp256k1PublicKey;
  address: string;
}> {
  return {
    publicKey: targetChain.publicKey,
    address: targetChain.evmAddress,
  };
}

export async function generateEthereumAccount({
  chainId,
  zAuthKeyPair,
}: Omit<
  HomeChainWithId,
  "targetChain" | "proxyAddress"
>): Promise<EthereumAccount> {
  const chain = secretJsChains[chainId];
  const ethKeyPair = generateSec256k1KeyPair();
  const address = await generateEthereumAddress(ethKeyPair);

  const client = new SecretJsClient(chainId);

  const feeLenders = JSON.parse(process.env.FEE_LENDERS || "[]");
  const feeLender = feeLenders[Math.floor(Math.random() * feeLenders.length)];
  const wallet = new SecretJsWallet(feeLender);

  const signedTransaction = await client.createAndSignTransaction({
    signer: new Secp256k1PrivateKeySigner(
      Buffer.from(wallet.privateKey).toString("base64"),
    ),
    messages: [
      new MsgExecuteContract({
        sender: wallet.address,
        contract_address: chain.secretSigner.address,
        msg: {
          add_key: {
            public_key: Buffer.from(
              zAuthKeyPair.publicKey.value,
              "base64",
            ).toString("hex"),
            user_entry_address: null,
            user_entry_code_hash: null,
            inject_privkey: Buffer.from(
              ethKeyPair.privateKey,
              "base64",
            ).toString("hex"),
          },
        },
        code_hash: chain.secretSigner.codeHash,
      }),
    ],
  });
  const broadcastTransactionResult = await client.broadcastSignedTransaction(
    signedTransaction,
  );
  console.log(broadcastTransactionResult);

  return {
    publicKey: ethKeyPair.publicKey,
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
