import { Base58EncodedString, Base64EncodedString } from "@obi-wallet/encoding";
import { toJS } from "mobx";
import { z } from "zod";

import {
  EncryptedBackupShare,
  EncryptedEasyShareForClient,
  EncryptedNetworkShare,
  MpcWalletSchema,
  UserEntryAddress,
  WalletData,
} from "./schema";
import { HomeChainId, SecretJsHomeChains } from "../../home-chains";
import { MultisigKeyEncryptedData } from "../../schemas";
import { MultisigKey } from "../multisig-key";

export class MpcWallet {
  public constructor(
    protected _homeChainId: HomeChainId,
    protected _owner: MultisigKey,
    protected _userEntryAddress: UserEntryAddress | null,
    protected _encryptedShares: {
      easy: EncryptedEasyShareForClient;
      backup: EncryptedBackupShare;
      network?: EncryptedNetworkShare;
    },
    protected _ed25519KeyPair: {
      publicKey: Base58EncodedString;
      encryptedPrivateKey: MultisigKeyEncryptedData;
    } | null,
    protected _secp256k1KeyPair: {
      publicKey: Base64EncodedString | null;
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

  public get id() {
    if (this._userEntryAddress) {
      return this._userEntryAddress;
    }

    return this._owner.address;
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

  public get encryptedNetworkShare() {
    return this._encryptedShares.network ?? null;
  }

  public get ed25519PublicKey() {
    return this._ed25519KeyPair?.publicKey ?? null;
  }

  public get secp256k1PublicKey() {
    return this._secp256k1KeyPair.publicKey;
  }

  public get encryptedEd25519PrivateKey() {
    return this._ed25519KeyPair?.encryptedPrivateKey ?? null;
  }

  public get previousWalletData() {
    return this._previousWalletData;
  }

  public setUserEntryAddress(userEntryAddress: UserEntryAddress) {
    this._userEntryAddress = userEntryAddress;
    this._encryptedShares = {
      easy: this._encryptedShares.easy,
      backup: this._encryptedShares.backup,
    };
  }

  public setEncryptedShares(encryptedShares: {
    easy: EncryptedEasyShareForClient;
    backup: EncryptedBackupShare;
  }) {
    this._encryptedShares = encryptedShares;
  }

  public setEd25519KeyPair(ed25519KeyPair: {
    publicKey: Base58EncodedString;
    encryptedPrivateKey: MultisigKeyEncryptedData;
  }) {
    this._ed25519KeyPair = ed25519KeyPair;
  }

  public setSecp256k1KeyPair(secp256k1KeyPair: {
    publicKey: Base64EncodedString;
  }) {
    this._secp256k1KeyPair = secp256k1KeyPair;
  }

  public setPreviousWalletData(previousWalletData: WalletData | null) {
    this._previousWalletData = previousWalletData;
  }

  public toJSON(): z.infer<typeof MpcWalletSchema> {
    if (this._userEntryAddress) {
      return {
        homeChain: this._homeChainId,
        owner: this._owner.toJSON(),
        userEntryAddress: this._userEntryAddress,
        encryptedShares: this._encryptedShares,
        ed25519KeyPair: this._ed25519KeyPair,
        secp256k1KeyPair: this._secp256k1KeyPair,
        previousWalletData: toJS(this._previousWalletData),
      };
    } else if (
      this._encryptedShares.network &&
      this._secp256k1KeyPair.publicKey
    ) {
      return {
        homeChain: this._homeChainId,
        owner: this._owner.toJSON(),
        userEntryAddress: null,
        encryptedShares: {
          easy: this._encryptedShares.easy,
          backup: this._encryptedShares.backup,
          network: this._encryptedShares.network,
        },
        ed25519KeyPair: this._ed25519KeyPair,
        secp256k1KeyPair: {
          publicKey: this._secp256k1KeyPair.publicKey,
        },
        previousWalletData: null,
      };
    }

    throw new Error("Invalid MPC wallet state");
  }
}
