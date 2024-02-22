import Provider from "@/components/provider";
import { rootStore } from "@/hooks/use-create-root-store";
import { MOCK_WALLET_DATA } from "@/mocks/wallet";
import { RootStore } from "@/stores";
import { obiModalConfig } from "@obi-wallet/config";
import { MockKVStore } from "@obi-wallet/headless-ui";
import { ObservableMpcWallet } from "@obi-wallet/sdk";
import { ReactNode } from "react";

const rootStoreWithWallet = new RootStore({
  deviceLanguage: "en",
  initialConfig: obiModalConfig,
  KVStore: MockKVStore,
});
const wallet = ObservableMpcWallet.create(MOCK_WALLET_DATA);
rootStoreWithWallet.mpcWalletsStore.upsertWallet(wallet);

export function ProviderWithWallet({ children }: { children: ReactNode }) {
  rootStore.current = rootStoreWithWallet;

  return <Provider>{children}</Provider>;
}

export function providerWithWalletDecorator(Story: () => ReactNode) {
  return (
    <ProviderWithWallet>
      <Story />
    </ProviderWithWallet>
  );
}
