import { Brand, Feature, WalletState } from "../../src";
import { MockKVStore } from "../../src/kv-store/mock";
import { RootStore } from "../../src/stores/root";

const kvStore = new MockKVStore("obi-wallets-store");

function createWalletsStore() {
  const rootStore = new RootStore({
    deviceLanguage: "en",
    initialConfig: {
      brand: Brand.Obi,
      chains: {
        enabled: ["juno-1"],
        default: "juno-1",
      },
      languages: {
        enabled: ["en"],
        default: "en",
      },
      features: {
        [Feature.AccountsTab]: false,
        [Feature.HealthChecks]: false,
        [Feature.NftTab]: false,
        [Feature.ObiWalletsStore]: true,
      },
    },
    KVStore: MockKVStore,
  });
  return rootStore.obiWalletsStore;
}

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
