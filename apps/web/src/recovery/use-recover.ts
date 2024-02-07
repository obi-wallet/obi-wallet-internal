import { useStore } from "@/contexts";
import { ProxyWallet } from "@/onboarding/onboarding-payload";
import { MultisigKey } from "@obi-wallet/sdk";

export function useRecover() {
  const { walletsStore } = useStore();

  async function recover({
    multisigKey,
    account,
  }: {
    multisigKey: MultisigKey;
    account: ProxyWallet;
  }) {
    const wallet = walletsStore.getWalletByProxyAddress(
      account.proxyAddress.address,
    );
    if (wallet) {
      walletsStore.setCurrentWallet(wallet);
    } else {
      await walletsStore.createWallet({
        multisigKey,
        demoMode: false,
        skipInit: true,
        homeAccountAddressOverride: account.proxyAddress.address,
        evmSigningAddressOverride: "",
        evmUserContractAddressOverride: "",
      });
    }
  }

  return recover;
}
