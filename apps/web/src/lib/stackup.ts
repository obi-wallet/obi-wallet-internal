import { TargetChain, TargetChainId } from "@obi-wallet/sdk";
import {
  getSec256k1UncompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import { AbstractSigner, computeAddress, Signer } from "ethers";
import { Presets } from "userop";

/**
 * A "signer" that is only capable of computing its address, for use with `Presets.Builder.SimpleAccount`
 */
class PublicKeyWallet extends AbstractSigner {
  public constructor(protected publicKey: Secp256k1PublicKey) {
    super();
  }

  public async getAddress(): Promise<string> {
    const u8 = getSec256k1UncompressedPublicKey(this.publicKey);
    return computeAddress(`0x${Buffer.from(u8).toString("hex")}`);
  }

  public connect(): Signer {
    throw new Error("connect not implemented.");
  }

  public signTransaction(): Promise<string> {
    throw new Error("signTransaction not implemented.");
  }

  public signMessage(): Promise<string> {
    throw new Error("signMessage not implemented.");
  }

  public signTypedData(): Promise<string> {
    throw new Error("signTypedData not implemented.");
  }
}

export async function generateEthereumAddresses(publicKey: Secp256k1PublicKey) {
  const config = getConfig(TargetChain.EthereumMainnet)!;
  const signer = new PublicKeyWallet(publicKey);
  const simpleAccount = await Presets.Builder.SimpleAccount.init(
    signer,
    config.rpcUrl,
  );
  return {
    evmSigningAddress: await signer.getAddress(),
    evmSimpleAccountAddress: simpleAccount.getSender(),
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
