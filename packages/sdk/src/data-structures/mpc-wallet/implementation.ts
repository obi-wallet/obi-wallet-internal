import { Base58EncodedString, Base64EncodedString } from "@obi-wallet/encoding";
import { toJS } from "mobx";

import { LegacyMpcWalletSchema, UserEntryAddress, WalletData } from "./schema";
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
    protected _ed25519KeyPair: {
      publicKey: Base58EncodedString;
      encryptedPrivateKey: string;
    } | null,
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

  public get ed25519PublicKey() {
    return this._ed25519KeyPair?.publicKey ?? null;
  }

  public get encryptedEd25519PrivateKey() {
    return this._ed25519KeyPair?.encryptedPrivateKey ?? null;
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

  public setEd25519KeyPair(ed25519KeyPair: {
    publicKey: Base58EncodedString;
    encryptedPrivateKey: string;
  }) {
    this._ed25519KeyPair = ed25519KeyPair;
  }

  public setPreviousWalletData(previousWalletData: WalletData | null) {
    this._previousWalletData = previousWalletData;
  }

  public get schema() {
    return LegacyMpcWalletSchema;
  }

  public toJSON() {
    return {
      homeChain: this._homeChainId,
      owner: this._owner.toJSON()!,
      userEntryAddress: UserEntryAddress.parse(this._userEntryAddress),
      encryptedShares: this._encryptedShares,
      ed25519KeyPair: this._ed25519KeyPair,
      previousWalletData: toJS(this._previousWalletData),
    };
  }
}
