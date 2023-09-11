import { EthereumAccount } from "@obi-wallet/headless-ui";
import {
  generateSec256k1KeyPair,
  Secp256k1KeyPair,
  Secp256k1PublicKey,
  SecretJsChainId,
  secretJsChains,
  SecretJsClient,
  TargetChain,
  TargetChainId,
} from "@obi-wallet/sdk";
import { Signer, SigningKey, Wallet } from "ethers";
import { MsgExecuteContract } from "secretjs";
import { Presets } from "userop";

import { HomeChainWithId } from "./db/schema";
import { getFeeLender } from "./fee-lender";

export async function recoverEthereumAccount({
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
  keyPair,
}: {
  chainId: SecretJsChainId;
  keyPair: Secp256k1KeyPair;
}): Promise<EthereumAccount> {
  const chain = secretJsChains[chainId];
  const ethKeyPair = generateSec256k1KeyPair();
  const address = await generateEthereumAddress(ethKeyPair);

  const client = new SecretJsClient(chainId);
  const { wallet, signer } = getFeeLender(chainId);

  const signedTransaction = await client.createAndSignTransaction({
    signer,
    messages: [
      new MsgExecuteContract({
        sender: wallet.address,
        contract_address: chain.secretSigner.address,
        msg: {
          add_key: {
            public_key: Buffer.from(keyPair.publicKey.value, "base64").toString(
              "hex",
            ),
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

export async function generateEthereumAddress(keyPair: Secp256k1KeyPair) {
  const config = getConfig(TargetChain.EthereumMainnet)!;
  const signingKey = new SigningKey(Buffer.from(keyPair.privateKey, "base64"));
  const signer: Signer = new Wallet(signingKey);
  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    // @ts-expect-error this should be fine
    signer,
    config.rpcUrl,
  );
  return simpleAccount.getSender();
}

export function getConfig(chainId: TargetChainId) {
  const apiKeys = JSON.parse(process.env.STACKUP_API_KEYS ?? "{}");
  const apiKey = apiKeys[chainId];

  if (!apiKey) return null;

  return {
    rpcUrl: `https://api.stackup.sh/v1/node/${apiKey}`,
    paymaster: {
      rpcUrl: `https://api.stackup.sh/v1/paymaster/${apiKey}`,
      context: { type: "payg" },
    },
  };
}
