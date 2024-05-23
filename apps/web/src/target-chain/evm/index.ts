import { EvmChainData, EvmChainId, EvmChains } from "@/target-chain/evm/chains";
import { EvmMpcSigner } from "@/target-chain/evm/mpc-signer";
import { MpcWallet } from "@obi-wallet/sdk";
import {
  AbstractTargetChain,
  AssetId,
} from "@obi-wallet/sdk-abstract-target-chain";
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
  Hex,
  http,
  isAddress,
  keccak256,
  LocalAccount,
} from "viem";
import { toAccount } from "viem/accounts";
import { z } from "zod";

export class EvmTargetChain extends AbstractTargetChain<EvmChainId, Hex> {
  protected readonly chainData: EvmChainData;

  public constructor(chainId: EvmChainId) {
    super(chainId);
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

  public get evmChainId() {
    return this.chainData.chain.id;
  }

  public computeAddress(publicKey: Secp256k1PublicKey) {
    const u8 = getSec256k1UncompressedPublicKey(publicKey);
    const hex = `0x${Buffer.from(u8).toString("hex")}`;
    const address = keccak256(`0x${hex.substring(4)}`).substring(26);
    return getAddress(`0x${address}`);
  }

  protected async obiAccountAddressQueryFn(publicKey: Secp256k1PublicKey) {
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

    const kernelAccount = await this.kernelAccount(account);
    return kernelAccount.address;
  }

  public async balancesQueryFn(address: string) {
    if (this.validateAddress(address)) {
      const balance = await this.publicClient.getBalance({
        address,
      });
      if (balance > 0) {
        return [
          {
            chainId: this.chainId,
            assetId: this.nativeCurrency.symbol,
            rawAmount: balance.toString(10),
          },
        ];
      }
    }
    return [];
  }

  public async priceQueryFn(id: AssetId) {
    if (id !== "ETH") {
      return { usdValue: "0" };
    }

    const url = `https://api.0xsquid.com/v1/token-price?chainId=${this.chainData.chain.id}&tokenAddress=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`;
    const response = await fetch(url);

    try {
      const schema = z.object({
        price: z.number(),
      });
      const { price } = schema.parse(await response.json());
      return { usdValue: price.toString(10) };
    } catch (e) {
      return { usdValue: "0" };
    }
  }

  public assetInfo(id: AssetId) {
    if (id === this.nativeCurrency.symbol) {
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

  public get entryPoint() {
    return ENTRYPOINT_ADDRESS_V07;
  }

  public validateAddress(address: string): address is Address {
    return isAddress(address);
  }

  public get nativeCurrency() {
    return this.chainData.chain.nativeCurrency;
  }

  public get publicClient() {
    return createPublicClient({
      chain: this.chainData.chain,
      transport: http(),
    });
  }

  public async kernelAccount(account: LocalAccount) {
    return await signerToEcdsaKernelSmartAccount(this.publicClient, {
      entryPoint: this.entryPoint,
      signer: account,
    });
  }

  public async signerFromWallet(wallet: MpcWallet) {
    return await EvmMpcSigner.fromWallet(wallet, this.chainId);
  }

  public async localAccountFromWallet(wallet: MpcWallet) {
    const signer = await this.signerFromWallet(wallet);
    return toAccount(signer.accountSource);
  }
}
