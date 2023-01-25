import { MockKVStore } from "../../src/kv-store/mock";
import { Brand, Feature } from "../../src/stores/config";
import { RootStore } from "../../src/stores/root";
import {
  CosmosMultisigWallet,
  WalletState,
  WalletType,
} from "../../src/stores/wallets";
import { CosmosSerializedData } from "../../src/stores/wallets/cosmos-multisig-wallet";
import { SerializedData } from "../../src/stores/wallets/serialized-data";

const kvStore = new MockKVStore("wallets-store");
const multisigKVStore = new MockKVStore("multisig-store");
const singlesigKVStore = new MockKVStore("singlesig-store");

function createWalletsStore() {
  const rootStore = new RootStore({
    deviceLanguage: "en",
    initialConfig: {
      brand: Brand.Obi,
      defaultMultisigWalletType: WalletType.TerraMultisig,
      cosmosChains: {
        enabled: ["juno-1"],
        default: "juno-1",
      },
      terraChains: {
        enabled: ["phoenix-1"],
        default: "phoenix-1",
      },
      languages: {
        enabled: ["en"],
        default: "en",
      },
      features: {
        [Feature.AccountsTab]: false,
        [Feature.HealthChecks]: false,
        [Feature.NftTab]: false,
        [Feature.Recovery]: false,
        [Feature.SinglesigWallets]: false,
        [Feature.InAppPurchases]: false,
        [Feature.Staking]: false,
        [Feature.BrandToggle]: false,
      },
    },
    KVStore: MockKVStore,
  });
  return rootStore.walletsStore;
}

beforeEach(() => {
  MockKVStore.reset();
});

test("Empty KVStore", async () => {
  const walletsStore = createWalletsStore();
  expect(walletsStore.state).toEqual(WalletState.LOADING);
  await walletsStore.__initPromise;
  expect(walletsStore.currentWallet).toEqual(null);
  expect(walletsStore.state).toEqual(WalletState.READY);
  expect(await kvStore.get("wallets")).toEqual({
    currentWalletIndex: null,
    wallets: [],
  });
});

test("KVStore with no wallets", async () => {
  await kvStore.set<SerializedData>("wallets", {
    currentWalletIndex: null,
    wallets: [],
  });
  const walletsStore = createWalletsStore();
  expect(walletsStore.state).toEqual(WalletState.LOADING);
  await walletsStore.__initPromise;
  expect(walletsStore.currentWallet).toEqual(null);
  expect(walletsStore.state).toEqual(WalletState.READY);
});

test("Legacy KVStores", async () => {
  const multisigSerializedData = {
    nextAdmin: {
      biometrics: null,
      phoneNumber: null,
      cloud: null,
      social: null,
    },
    currentAdmin: null,
    proxyAddresses: {},
  };
  const singlesigSerializedData = "mnemonic";
  await multisigKVStore.set<CosmosSerializedData.SerializedData>(
    "multisig",
    multisigSerializedData
  );
  await singlesigKVStore.set<string>("singlesig", singlesigSerializedData);
  const walletsStore = createWalletsStore();
  expect(walletsStore.state).toEqual(WalletState.LOADING);
  await walletsStore.__initPromise;
  expect(walletsStore.currentWallet).toBeInstanceOf(CosmosMultisigWallet);
  expect(walletsStore.state).toEqual(WalletState.READY);
  expect(await multisigKVStore.get("multisig")).toBeUndefined();
  expect(await singlesigKVStore.get("singlesig")).toBeUndefined();
  expect(await kvStore.get("wallets")).toEqual({
    currentWalletIndex: 0,
    wallets: [
      {
        type: "cosmos-multisig",
        data: multisigSerializedData,
      },
      {
        type: "cosmos-singlesig",
        data: singlesigSerializedData,
      },
    ],
  });
});

test("Fail on invalid data", async () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  jest.spyOn(console, "error").mockImplementation(() => {});
  const invalidData = { invalid: [] };
  await kvStore.set("wallets", invalidData);
  const walletsStore = createWalletsStore();
  await walletsStore.__initPromise;
  expect(walletsStore.currentWallet).toEqual(null);
  expect(walletsStore.state).toEqual(WalletState.INVALID);
  expect(await kvStore.get("wallets")).toEqual(invalidData);
});

describe("MultisigWallet", () => {
  test("Empty multisig wallet", async () => {
    const walletsStore = createWalletsStore();
    await walletsStore.__initPromise;
    const wallet = await walletsStore.addCosmosMultisigWallet();
    expect(walletsStore.currentWallet).toEqual(wallet);
    expect(wallet.isDemo).toEqual(false);
    expect(wallet.isReady).toEqual(false);
  });
});

describe("TerraMultisigWallet", () => {
  test("Empty terra multisig wallet", async () => {
    const walletsStore = createWalletsStore();
    await walletsStore.__initPromise;
    const wallet = await walletsStore.addTerraMultisigWallet();
    expect(walletsStore.currentWallet).toEqual(wallet);
    expect(wallet.isReady).toEqual(false);
  });
});
