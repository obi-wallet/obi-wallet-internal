// eslint-disable-next-line import/no-extraneous-dependencies
import { Signer, SigningKey, Wallet } from "ethers";
// eslint-disable-next-line import/no-extraneous-dependencies
import invariant from "tiny-invariant";
import { Presets } from "userop";

import { WalletsSchema } from "./schema";
import { ChainId } from "../../chains";
import { Secp256k1KeyPair } from "../../keys/sec256k1";
import { WalletsSdk } from "../../sdk/wallets";
import { Serialized } from "../abstract";
import { createGatekeeperConfig } from "../gatekeeper-config";
import { AbstractMigratable, AbstractSerialized } from "../migratable";
import { MultisigKey } from "../multisig-key";
import { MultisigKeySchema } from "../multisig-key/schema";
import { MultisigWallet } from "../multisig-wallet";

export class Wallets {
  public get schema() {
    return WalletsSchema;
  }

  public constructor(
    protected _wallets: MultisigWallet[],
    protected _currentChainId: ChainId | null,
    protected _currentWalletIndexPerChain: Partial<
      Record<ChainId, number | null>
    >,
    protected _factory: typeof MultisigWallet,
    protected _serialize: <T>(serialized: T) => T,
  ) {}

  public toJSON(): AbstractSerialized<typeof WalletsSchema> {
    return {
      wallets: this._wallets.map((w) => w.toJSON()),
      currentChainId: this._currentChainId,
      currentWalletIndexPerChain: this._serialize(
        this._currentWalletIndexPerChain,
      ),
    };
  }

  public deserialize(migratable: AbstractMigratable<typeof WalletsSchema>) {
    const serialized = WalletsSchema.migratableSchema.parse(migratable);
    this._wallets = serialized.wallets.map((w) => this._factory.create(w));
    this._currentChainId = serialized.currentChainId;
    this._currentWalletIndexPerChain = serialized.currentWalletIndexPerChain;
  }

  public get wallets() {
    return this._wallets;
  }

  public get currentChainId() {
    return this._currentChainId;
  }

  public setCurrentChain(chainId: ChainId) {
    this._currentChainId = chainId;
  }

  protected get currentWalletIndex() {
    if (!this._currentChainId) return null;
    return this._currentWalletIndexPerChain?.[this._currentChainId] ?? null;
  }

  public get currentWallet() {
    if (typeof this.currentWalletIndex !== "number") return null;
    return this._wallets[this.currentWalletIndex];
  }

  public get address(): string | null {
    return this.currentWallet?.address ?? null;
  }

  public setCurrentWallet(wallet: MultisigWallet) {
    const index = this._wallets.findIndex((w) => w.id === wallet.id);
    if (index !== -1) {
      this._currentChainId = wallet.chainId;
      this._currentWalletIndexPerChain[wallet.chainId] = index;
    }
  }

  public logout() {
    if (!this._currentChainId) return;
    delete this._currentWalletIndexPerChain[this._currentChainId];
  }

  public getWalletByProxyAddress(proxyAddress: string) {
    return this._wallets.find((w) => w.proxyAddress === proxyAddress);
  }

  /// Creates a home chain account for the user owned by `multisigKey.`
  /// Also adds a new simple signer key that is owned by the multisig.
  public async createWallet({
    multisigKey,
    demoMode,
    skipInit,
    evmSigningAddressOverride,
    evmUserContractAddressOverride,
    homeAccountAddressOverride,
  }: {
    multisigKey: MultisigKey;
    demoMode: boolean;
    skipInit?: boolean | undefined;
    evmSigningAddressOverride?: string | undefined;
    evmUserContractAddressOverride?: string | undefined;
    homeAccountAddressOverride?: string | undefined;
  }) {
    let response;
    if (!skipInit) {
      response = await this.walletsSdk.getAsyncDetailsAndFirstOwnerUpdate({
        multisigKey,
        demoMode,
      });
      multisigKey.evmSigningAddress = response.evmSigningAddress;
      multisigKey.evmUserContractAddress = response.evmUserContractAddress;
    } else {
      multisigKey.evmSigningAddress = evmSigningAddressOverride!;
      multisigKey.evmUserContractAddress = evmUserContractAddressOverride!;
    }
    const ownerMultisig = multisigKey.toJSON();
    console.log(
      "ownerMultisig in createWallet() is " + JSON.stringify(ownerMultisig),
    );
    invariant(Object.keys(ownerMultisig!).length !== 0, "empty ownerMultisig");
    const definedOwnerMultisig: AbstractSerialized<typeof MultisigKeySchema> =
      ownerMultisig as AbstractSerialized<typeof MultisigKeySchema>;
    console.log(
      "definedOwnerMultisig is " + JSON.stringify(definedOwnerMultisig),
    );
    const wallet = this._factory.create({
      type: demoMode ? "multisig-demo" : "multisig",
      data: {
        chain: multisigKey.chainId,
        gatekeeperConfig: createGatekeeperConfig().toJSON(),
        owner: definedOwnerMultisig,
        proxyAddress: {
          v: 1,
          address: skipInit
            ? homeAccountAddressOverride!
            : response!.homeAccountAddress,
        },
        singlesigWallets: [],
        currentAccount: null,
        evmSigningAddress: skipInit
          ? evmSigningAddressOverride!
          : response!.evmSigningAddress,
        evmUserContractAddress: skipInit
          ? evmUserContractAddressOverride!
          : response!.evmUserContractAddress,
      },
    });
    wallet.setEvmSigningAddress(
      skipInit ? evmSigningAddressOverride! : response!.evmSigningAddress,
      true,
    );
    wallet.setEvmUserContractAddress(
      skipInit
        ? evmUserContractAddressOverride!
        : response!.evmUserContractAddress,
    );
    this.upsertWallet(wallet);
    this.setCurrentWallet(wallet);
    return response;
  }

  async generate4337Address(keyPair: Secp256k1KeyPair) {
    const signingKey = new SigningKey(
      Buffer.from(keyPair.privateKey, "base64"),
    );
    const signer: Signer = new Wallet(signingKey);
    const simpleAccount = await Presets.Builder.SimpleAccount.init(
      // @ts-expect-error this should be fine
      signer,
      "https://api.stackup.sh/v1/node/ba320f6132714fa44989496f90aa8f059c55113322b22752ebf5a6bda111ac00",
    );
    return simpleAccount.getSender();
  }

  public async recoverWallet({
    serializedData,
    newOwner,
  }: {
    serializedData: Serialized<MultisigWallet>["data"];
    newOwner: MultisigKey;
  }) {
    const wallet = this._factory.create({
      type: "multisig",
      data: serializedData,
    });
    const response = await wallet.updateOwner(newOwner);
    if (response.approved && response.payload.success) {
      this.upsertWallet(wallet);
    }
    return response;
  }

  public upsertWallet(wallet: MultisigWallet) {
    this._wallets.push(wallet);
    this.setCurrentWallet(wallet);
  }

  public removeWallet(wallet: MultisigWallet) {
    this._wallets = this._wallets.filter((w) => w.id !== wallet.id);
  }

  protected get walletsSdk() {
    return new WalletsSdk();
  }
}
