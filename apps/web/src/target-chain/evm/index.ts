import { EvmChainData, EvmChainId, EvmChains } from "@/target-chain/evm/chains";
import { AbstractTargetChain } from "@obi-wallet/sdk-abstract-target-chain";
import {
  getSec256k1UncompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import { ENTRYPOINT_ADDRESS_V07 } from "permissionless";
import { signerToEcdsaKernelSmartAccount } from "permissionless/accounts";
import {
  Address,
  createPublicClient,
  getAddress,
  http,
  isAddress,
  keccak256,
} from "viem";
import { toAccount } from "viem/accounts";

export class EvmTargetChain extends AbstractTargetChain {
  protected readonly chainData: EvmChainData;

  public constructor(chainId: EvmChainId) {
    super();
    this.chainData = EvmChains[chainId];
  }

  public get label(): string {
    return this.chainData.chain.name;
  }

  public get image(): string {
    return this.chainData.image;
  }

  public get disabled(): boolean {
    return this.chainData.disabled ?? false;
  }

  public computeAddress(publicKey: Secp256k1PublicKey) {
    const u8 = getSec256k1UncompressedPublicKey(publicKey);
    const hex = `0x${Buffer.from(u8).toString("hex")}`;
    const address = keccak256(`0x${hex.substring(4)}`).substring(26);
    return getAddress(`0x${address}`);
  }

  public async obiAccountAddress(publicKey: Secp256k1PublicKey) {
    const publicClient = createPublicClient({
      chain: this.chainData.chain,
      transport: http(),
    });

    const account = toAccount({
      address: this.computeAddress(publicKey),
      async signMessage() {
        throw new Error("signMessage not implemented");
      },
      async signTransaction() {
        throw new Error("signTransaction not implemented");
      },
      async signTypedData() {
        throw new Error("signTypedData not implemented");
      },
    });

    const kernelAccount = await signerToEcdsaKernelSmartAccount(publicClient, {
      entryPoint: ENTRYPOINT_ADDRESS_V07,
      signer: account,
    });

    return kernelAccount.address;
  }

  public getAsset(denom: string) {
    if (denom === this.nativeCurrency.symbol) {
      return {
        name: this.nativeCurrency.name,
        symbol: this.nativeCurrency.symbol,
        decimals: this.nativeCurrency.decimals,
        // TODO:
        image: null,
      };
    }

    return null;
  }

  public validateAddress(address: string): address is Address {
    return isAddress(address);
  }

  public get nativeCurrency() {
    return this.chainData.chain.nativeCurrency;
  }
}
