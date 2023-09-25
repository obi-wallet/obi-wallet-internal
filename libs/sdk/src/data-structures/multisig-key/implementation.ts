import { ethers } from "ethers";
import * as R from "ramda";
import { TxResponse } from "secretjs";

import { SetupMultisigKeyDetails } from "./factories";
import { MultisigKeySchema } from "./schema";
import { ChainId, secretJsChains } from "../../chains";
import {
  MultisigPublicKey,
  Secp256k1KeyPair,
  Secp256k1PublicKey,
  generateSec256k1KeyPair,
} from "../../keys";
import { Sdk } from "../../sdk";
import { SerializedProxyWallet } from "../../sdk/wallets/secret-js-msig/types";
import { Message } from "../../transactions";
import { AbstractDataStructure } from "../abstract";
import {
  Key,
  KeyAbstractSerializedMapping,
  KeySubclassTypeMapping,
  KeyType,
} from "../key";
import { KeySchema } from "../key/schema";
import { AbstractSerialized } from "../migratable";
import { WalletMeta } from "../multisig-wallet";

export class MultisigKey {
  // TODO: private, getters
  public evmSigningAddress: string;
  public evmUserContractAddress: string;
  public get schema() {
    return MultisigKeySchema;
  }

  public constructor(
    // async account creation returns some values;
    // they're stored here so they can be ready for
    // the actual "Create Wallet" button
    protected _setupDetails: SetupMultisigKeyDetails | undefined,
    protected _chainId: ChainId,
    protected _keys: Key[],
    protected _threshold: number,
    protected _factories: {
      Key: AbstractDataStructure<Key, typeof KeySchema>;
      createMultisigKey: (
        setupDetails: SetupMultisigKeyDetails | undefined,
        chain: ChainId,
        serialized?: AbstractSerialized<typeof MultisigKeySchema>,
      ) => MultisigKey;
    },
  ) {
    this.evmSigningAddress = "";
    this.evmUserContractAddress = "";
  }

  public get setupDetails() {
    return this._setupDetails;
  }

  public toJSON(): AbstractSerialized<typeof MultisigKeySchema> | undefined {
    if (!this._keys) {
      return;
    }
    return {
      keys: this._keys.map((key: Key) => key.toJSON()),
      threshold: this._threshold,
      evmSigningAddress: this.evmSigningAddress,
      evmUserContractAddress: this.evmUserContractAddress,
    };
  }

  public equals(other: MultisigKey) {
    return R.equals(this.toJSON(), other.toJSON());
  }

  public clone() {
    return this._factories.createMultisigKey(
      this._setupDetails,
      this.chainId,
      this.toJSON(),
    );
  }

  public get chainId() {
    return this._chainId;
  }

  public get threshold() {
    return this._threshold;
  }

  public setThreshold(threshold: number) {
    this._threshold = threshold;
  }

  public get publicKey(): MultisigPublicKey {
    return {
      type: "tendermint/PubKeyMultisigThreshold",
      value: {
        pubkeys: this._keys.map((key) => key.publicKey),
        threshold: this._threshold.toString(),
      },
    };
  }

  public get address() {
    return this.sdk.transactions.getAddressOfPublicKey(this.publicKey);
  }

  public get keys() {
    return this._keys;
  }

  public get signerTypes() {
    return this._keys.map((key) => key.type);
  }

  public hasKeyOfType(type: KeyType) {
    return this._keys.some((key) => key.type === type);
  }

  public getKeyOfType<T extends KeyType>(type: T) {
    return this._keys.find((key): key is KeySubclassTypeMapping[T] => {
      return key.type === type;
    });
  }

  public getUsableKeyOfType<T extends KeyType>(type: T) {
    return this._keys.find((key): key is KeySubclassTypeMapping[T] => {
      return key.type === type && key.isUsable;
    });
  }

  private async createMagicAccount() {
    // TODO: retry logic
    console.log("Calling setup/home-account with fee address as owner");
    const response = await fetch("/api/setup/home-account", {
      method: "POST",
      body: JSON.stringify({}),
    });
    const {
      ownerIndex,
      homeAccountAddress,
      txResult,
    }: {
      ownerIndex: number;
      homeAccountAddress: string;
      txResult: TxResponse;
    } = await response.json();
    console.log(
      "home account: " +
        homeAccountAddress +
        ", tx hash " +
        txResult.transactionHash,
      ", owner index: " + ownerIndex,
    );

    const chain = secretJsChains["secret-4"];

    // now we can add a key. The ownerIndex fee wallet will be able
    // to use it to sign for now (to setup account) if needed,
    // until first_update_owner
    const addKeyResponse = await fetch("/api/setup/add-key", {
      method: "POST",
      body: JSON.stringify({
        userEntryAddress: homeAccountAddress,
        userEntryCodeHash: chain.userEntry.codeHash,
      }),
    });

    const addKeyResponseJson = await addKeyResponse.json();
    console.log("add-key-response: " + JSON.stringify(addKeyResponseJson));
    if (addKeyResponseJson.success) {
      const {
        success,
        publicKey,
        evmSigningAddress,
        evmUserContractAddress,
      }: {
        success: boolean;
        publicKey: Secp256k1PublicKey;
        evmSigningAddress: string;
        evmUserContractAddress: string;
      } = addKeyResponseJson;
      const _unused = { success, publicKey };

      this._setupDetails = {
        homeAccountAddress,
        evmSigningAddress,
        evmUserContractAddress,
        ownerIndex,
      };
    }
  }

  // duplicated for now due to circular dependency
  private async getProxyWalletsCloudflare(publicKey: string) {
    try {
      const response = await fetch(
        `https://proxy-wallets.obiwallet.workers.dev`,
        // `http://127.0.0.1:8787`,
        {
          method: "POST",
          body: JSON.stringify({
            chainId: "secret-4",
            publicKey,
          }),
          headers: {
            "Api-Version": "v1",
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
          },
        },
      );
      const proxyWallets = (await response.json()) as unknown[];
      return proxyWallets;
    } catch (e) {
      //probably no wallets
      console.log("cloudflare worker recover error: " + JSON.stringify(e));
      return [];
    }
  }

  /// Returns true if we should proceed to recovery
  private async setupMagicAccountIfDoesNotExist(
    publicKey: string,
    existingUserSaysDeviceIsNew?: boolean,
    recoverFlow?: boolean //avoids creating a new account even if no proxy wallets found
  ): Promise<SerializedProxyWallet[] | undefined> {
    try {
      const proxyWallets = (await this.getProxyWalletsCloudflare(
        publicKey,
      )) as SerializedProxyWallet[];
      if (proxyWallets.length === 0) {
        if (!existingUserSaysDeviceIsNew && !recoverFlow) {
          this.createMagicAccount();
        }
        return undefined;
      } else {
        return proxyWallets;
      }
    } catch (e) {
      if (!existingUserSaysDeviceIsNew && !recoverFlow) {
        this.createMagicAccount();
      }
      return undefined;
    }
  }

  public async setDeviceKey(
    keyPair: {
      publicKey: Secp256k1PublicKey;
      privateKey?: string;
    },
    deviceIsNew?: boolean,
    recoverFlow?: boolean //avoids creating a new account even if no proxy wallets found
  ): Promise<SerializedProxyWallet[] | undefined> {
    this.setKey({
      type: KeyType.Device,
      payload: keyPair,
    });
    // TODO: confirm user is a new user here
    // don't await here
    if (!this._setupDetails) {
      this._setupDetails = {
        homeAccountAddress: "",
        evmSigningAddress: "",
        evmUserContractAddress: "",
        ownerIndex: 0,
      };

      const proxyWallets = this.setupMagicAccountIfDoesNotExist(
        keyPair.publicKey.value,
        deviceIsNew,
        recoverFlow // avoids creating a new account even if proxy wallets not found
      );
      if (proxyWallets) {
        return proxyWallets;
      } else {
        return undefined;
      }
    }
    console.log("Current draft multisig: " + JSON.stringify(this));
    return undefined;
  }

  public async setUnityKey(
    deviceId: string,
    deviceIsNew?: boolean,
    recoverFlow?: boolean //avoids creating a new account even if no proxy wallets found
  ): Promise<SerializedProxyWallet[] | undefined> {
    // use unity device ID to generate a keypair right here,
    // without a function call, and set it as the unity key

    const hexStringToUint8Array = (hexString: string) => {
      if (hexString.startsWith("0x")) {
        hexString = hexString.slice(2);
      }

      const byteValues = [];
      for (let i = 0; i < hexString.length; i += 2) {
        byteValues.push(parseInt(hexString.substr(i, 2), 16));
      }

      return new Uint8Array(byteValues);
    };

    const toHash = ethers.toUtf8Bytes(deviceId + "102h01s8b93fptb8ftb82t");
    const hash = ethers.keccak256(toHash);
    const keyPair = generateSec256k1KeyPair(hexStringToUint8Array(hash));
    console.log(
      "Unity keypair generate with pubkey " + keyPair.publicKey.value,
    );

    this.setKey({
      type: KeyType.Unity,
      payload: keyPair,
    });
    // TODO: confirm user is a new user here?
    // don't await here
    if (!this._setupDetails) {
      this._setupDetails = {
        homeAccountAddress: "",
        evmSigningAddress: "",
        evmUserContractAddress: "",
        ownerIndex: 0,
      };
      const proxyWallets = this.setupMagicAccountIfDoesNotExist(
        keyPair.publicKey.value,
        deviceIsNew,
        recoverFlow // avoids creating a new account even if proxy wallets not found
      );
      if (proxyWallets) {
        return proxyWallets;
      } else {
        return undefined;
      }
    }
    console.log("Current draft multisig: " + JSON.stringify(this));
    return undefined;
  }

  public setPhoneKey(payload: {
    publicKey: Secp256k1PublicKey;
    privateKey: string;
    phoneNumber: string;
    securityQuestion: string;
  }) {
    this.setKey({
      type: KeyType.Phone,
      payload,
    });
    console.log("Current multisig draft is: " + JSON.stringify(this));
  }

  public setSocialKey(publicKey: Secp256k1PublicKey) {
    this.setKey({
      type: KeyType.Social,
      payload: {
        publicKey,
      },
    });
  }

  public setNfcKey(payload: {
    publicKey: Secp256k1PublicKey;
    localEntropy: string;
  }) {
    this.setKey({
      type: KeyType.Nfc,
      payload,
    });
  }

  public setCloudKey(payload: Secp256k1KeyPair & { provider: "google-drive" }) {
    this.setKey({
      type: KeyType.Cloud,
      payload,
    });
  }

  public setEmailKey(publicKey: Secp256k1PublicKey) {
    this.setKey({
      type: KeyType.Email,
      payload: {
        publicKey,
      },
    });
  }

  public setEmailRecoveryKey(key: Secp256k1KeyPair) {
    this.setKey({
      type: KeyType.EmailRecovery,
      payload: key,
    });
  }

  public setZAuthKey(publicKey: Secp256k1PublicKey) {
    this.setKey({
      type: KeyType.ZAuth,
      payload: {
        publicKey,
        privateKey: "",
      },
    });
  }

  protected setKey<T extends KeyType>(key: KeyAbstractSerializedMapping[T]) {
    this._keys = this._keys.filter((k) => key.type !== k.type);
    this._keys.push(this._factories.Key.create(key));
    // sort the keys by type, and then by public key
    this._keys = this._keys.sort((a, b) => {
      if (a.type < b.type) {
        return -1;
      } else if (a.type > b.type) {
        return 1;
      } else {
        if (a.publicKey.value < b.publicKey.value) {
          return -1;
        } else if (a.publicKey.value > b.publicKey.value) {
          return 1;
        } else {
          return 0;
        }
      }
    });
  }

  public removeKeyOfType<T extends KeyType>(type: T) {
    this._keys = this._keys.filter((key) => key.type !== type);
  }

  public async createSigner(
    { messages }: { messages: Message[] },
    evmSigningAddress?: string,
    walletMeta?: WalletMeta,
  ) {
    console.log("in createSigner(), messages are: " + JSON.stringify(messages));
    return await this.sdk.transactions.createMultisigSigner({
      multisigPublicKey: this.publicKey,
      messages,
      evmSigningAddress,
      walletMeta,
    });
  }

  protected get sdk() {
    return Sdk.chainId(this._chainId);
  }
}
