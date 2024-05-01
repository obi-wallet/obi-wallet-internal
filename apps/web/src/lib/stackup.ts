import { TargetChainId } from "@obi-wallet/sdk";
import {
  getSec256k1UncompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import { V06 } from "userop";
import {
  createPublicClient,
  createWalletClient,
  getAddress,
  http,
  keccak256,
} from "viem";
import { toAccount } from "viem/accounts";
import { mainnet } from "viem/chains";

function publicKeyToAddress(publicKey: Secp256k1PublicKey) {
  const u8 = getSec256k1UncompressedPublicKey(publicKey);
  const hex = `0x${Buffer.from(u8).toString("hex")}`;
  const address = keccak256(`0x${hex.substring(4)}`).substring(26);
  return getAddress(`0x${address}`);
}

export async function generateEthereumAddresses(publicKey: Secp256k1PublicKey) {
  const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
  });

  const address = publicKeyToAddress(publicKey);
  const walletClient = createWalletClient({
    account: toAccount({
      address,
      async signMessage() {
        throw new Error("signMessage not implemented");
      },
      async signTransaction() {
        throw new Error("signTransaction not implemented");
      },
      async signTypedData() {
        throw new Error("signTypedData not implemented");
      },
    }),
    chain: mainnet,
    transport: http(),
  });

  const account = new V06.Account.Instance({
    ...V06.Account.Common.SimpleAccount.base(publicClient, walletClient),
  });

  const sender = await account.getSender();

  return {
    evmSigningAddress: address,
    evmSimpleAccountAddress: sender,
  };
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
