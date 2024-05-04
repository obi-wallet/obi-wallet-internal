import { EvmChainId } from "@/target-chain/evm/chains";
import { AbstractTargetChain } from "@obi-wallet/sdk-abstract-target-chain";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";

export class EvmTargetChain extends AbstractTargetChain {
  public constructor(_chainId: EvmChainId) {
    super();
  }

  // TODO:
  public get label(): string {
    return "";
  }

  // TODO:
  public get image(): string {
    return "";
  }

  // TODO:
  public get disabled(): boolean {
    return true;
  }

  // TODO:
  public computeAddress(_publicKey: Secp256k1PublicKey) {
    return "";
  }

  // TODO:
  public validateAddress(_address: string) {
    return false;
  }
}
