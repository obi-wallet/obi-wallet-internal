import { MpcWalletSchema } from "./schema";
import { HomeChainId, SecretJsHomeChains } from "../../home-chains";
import { AbstractSerialized } from "../migratable";
import { MultisigKey } from "../multisig-key";

export class MpcWallet {
  public constructor(
    protected _homeChainId: HomeChainId,
    protected _owner: MultisigKey,
    protected _userEntryAddress: string,
    protected _encryptedShares: {
      easy: string;
      backup: string;
    },
  ) {}

  public get homeChainId() {
    return this._homeChainId;
  }

  public get homeChain() {
    return SecretJsHomeChains[this._homeChainId];
  }

  public get owner() {
    return this._owner;
  }

  public get userEntryAddress() {
    return this._userEntryAddress;
  }

  public get encryptedEasyShare() {
    return this._encryptedShares.easy;
  }

  public get schema() {
    return MpcWalletSchema;
  }

  public toJSON(): AbstractSerialized<typeof MpcWalletSchema> {
    return {
      homeChain: this._homeChainId,
      owner: this._owner.toJSON()!,
      userEntryAddress: this._userEntryAddress,
      encryptedShares: this._encryptedShares,
    };
  }
}
