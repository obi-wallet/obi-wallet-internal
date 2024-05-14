import { Base64EncodedString } from "@obi-wallet/encoding";
import { toJS } from "mobx";

import { MpcWalletSchema, UserEntryAddress, WalletData } from "./schema";
import { HomeChainId, SecretJsHomeChains } from "../../home-chains";
import { MultisigKey } from "../multisig-key";

export class MpcWallet {
  public constructor(
    protected _homeChainId: HomeChainId,
    protected _owner: MultisigKey,
    protected _userEntryAddress: string,
    protected _encryptedShares: {
      easy: Base64EncodedString;
      backup: string;
    },
    protected _previousWalletData: WalletData | null,
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

  public setOwner(owner: MultisigKey) {
    this._owner = owner;
  }

  public get userEntryAddress() {
    return this._userEntryAddress;
  }

  public get encryptedEasyShare() {
    return this._encryptedShares.easy;
  }

  public get encryptedBackupShare() {
    return this._encryptedShares.backup;
  }

  public get previousWalletData() {
    return this._previousWalletData;
  }

  public setEncryptedShares(encryptedShares: {
    easy: Base64EncodedString;
    backup: string;
  }) {
    this._encryptedShares = encryptedShares;
  }

  public setPreviousWalletData(previousWalletData: WalletData | null) {
    this._previousWalletData = previousWalletData;
  }

  public get schema() {
    return MpcWalletSchema;
  }

  public toJSON() {
    return {
      homeChain: this._homeChainId,
      owner: this._owner.toJSON()!,
      userEntryAddress: UserEntryAddress.parse(this._userEntryAddress),
      encryptedShares: this._encryptedShares,
      previousWalletData: toJS(this._previousWalletData),
    };
  }
}
