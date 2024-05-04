import { EvmChainData, EvmChainId, EvmChains } from "@/target-chain/evm/chains";
import { AbstractTargetChain } from "@obi-wallet/sdk-abstract-target-chain";
import {
  getSec256k1UncompressedPublicKey,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk-secp256k1";
import { getAddress, isAddress, keccak256 } from "viem";

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

  public validateAddress(address: string) {
    return isAddress(address);
  }
}
