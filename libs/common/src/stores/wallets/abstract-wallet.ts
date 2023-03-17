import { Bech32Address } from "@keplr-wallet/cosmos";
import { Chain } from "@obi-wallet/sdk";

export enum WalletType {
  Multisig = "Multisig",
  CosmosMultisig = "CosmosMultisig",
  TerraMultisig = "TerraMultisig",
}

export abstract class AbstractWallet {
  public abstract get id(): string;
  public abstract get type(): WalletType;
  public abstract get chain(): Chain;
  public abstract get address(): string | null;
  public abstract get isReady(): boolean;

  public get shortenedAddress(): string | null {
    const address = this.address;
    return address ? Bech32Address.shortenAddress(address, 20) : null;
  }
}
