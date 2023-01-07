import { TerraChain } from "../../chains";
import { AbstractWallet, WalletType } from "../wallets/abstract-wallet";

export class TerraMultisigWallet extends AbstractWallet {
  protected readonly _id: string;
  protected readonly chain: TerraChain;

  constructor({ id, chain }: { id: string; chain: TerraChain }) {
    super();
    this._id = id;
    this.chain = chain;
  }

  // TODO:
  get address(): string | null {
    return null;
  }

  public get id() {
    return this._id;
  }

  get isReady(): boolean {
    return false;
  }

  // TODO:
  get type(): WalletType {
    return WalletType.Multisig;
  }
}
