import { EthereumAccount } from "@obi-wallet/headless-ui";
import {
  generateSec256k1KeyPair,
  Sdk,
  Secp256k1KeyPair,
  Secp256k1PrivateKeySigner,
  SecretJsChainId,
  secretJsChains,
  SecretJsClient,
} from "@obi-wallet/sdk";
import { Signer, SigningKey, Wallet } from "ethers";
import secp256k1 from "secp256k1";
import { MsgExecuteContract } from "secretjs";
import { Presets } from "userop";

import { SecretJsSigner } from "./secret-js-signer";

const config = {
  rpcUrl: process.env.STACKUP_RPC_URL,
  paymaster: {
    rpcUrl: process.env.STACKUP_PAYMASTER_RPC_URL,
    context: { type: "payg" },
  },
};

export async function recoverOrCreateEthereumAccount({
  keyPair,
  chainId,
  proxyAddress,
}: {
  keyPair: Secp256k1KeyPair;
  chainId: SecretJsChainId;
  proxyAddress: string;
}) {
  try {
    return await recoverEthereumAccount({ keyPair, chainId });
  } catch (e) {
    console.log(e);
    return await generateEthereumAccount({ keyPair, chainId, proxyAddress });
  }
}

async function recoverEthereumAccount({
  keyPair,
  chainId,
}: {
  keyPair: Secp256k1KeyPair;
  chainId: SecretJsChainId;
}) {
  const signer = new SecretJsSigner({
    chainId,
    keyPair,
  });
  // @ts-expect-error this should be fine
  const address = await generateEthereumAddressFromSigner(signer);
  const pubKeyRaw = new Uint8Array(
    Buffer.from((await signer.getPublicKey()).slice(2), "hex"),
  );
  const compressed = secp256k1.publicKeyConvert(pubKeyRaw, true);

  return {
    publicKey: {
      type: "tendermint/PubKeySecp256k1",
      value: new Buffer(compressed).toString("base64"),
    },
    address,
  };
}

async function generateEthereumAccount({
  chainId,
  proxyAddress,
  keyPair,
}: {
  chainId: SecretJsChainId;
  proxyAddress: string;
  keyPair: Secp256k1KeyPair;
}): Promise<EthereumAccount> {
  const chain = secretJsChains[chainId];
  const ethKeyPair = generateSec256k1KeyPair();
  const address = await generateEthereumAddress(keyPair);

  const client = new SecretJsClient(chainId);
  const hash = await client.withSecretNetworkClient(async (client) => {
    const contract = await client.query.compute.contractInfo({
      contract_address: proxyAddress,
    });
    return client.query.compute.codeHashByCodeId({
      code_id: contract.ContractInfo?.code_id,
    });
  });

  const signedTransaction = await client.createAndSignTransaction({
    signer: new Secp256k1PrivateKeySigner(keyPair.privateKey),
    messages: [
      new MsgExecuteContract({
        sender: Sdk.chainId(chainId).transactions.getAddressOfPublicKey(
          keyPair.publicKey,
        ),
        contract_address: chain.secretSigner.address,
        msg: {
          add_key: {
            public_key: Buffer.from(keyPair.publicKey.value, "base64").toString(
              "hex",
            ),
            user_entry_address: proxyAddress,
            user_entry_code_hash: hash.code_hash,
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

async function generateEthereumAddressFromSigner(signer: Signer) {
  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    // @ts-expect-error this should be fine
    signer,
    config.rpcUrl,
  );
  return simpleAccount.getSender();
}

export const getStackupRpcUrls = (
  apiKey: string,
): { paymasterRpcUrl: string; rpcUrl: string } => ({
  paymasterRpcUrl: `https://api.stackup.sh/v1/paymaster/${apiKey}`,
  rpcUrl: `https://api.stackup.sh/v1/node/${apiKey}`,
});
