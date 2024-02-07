import { useStore } from "@/contexts";
import { MultisigKey } from "@obi-wallet/sdk";
import { z } from "zod";

const ProxyWallet = z.object({
  proxyAddress: z.object({
    address: z.string(),
    codeId: z.number(),
  }),
  owner: z.object({
    threshold: z.string(),
    // TODO: here we should probably be more specific regarding the structure of `keys`, review /add logic and make sure the schema usage is consistent here.
    keys: z.array(z.unknown()),
  }),
});

export type ProxyWallet = z.TypeOf<typeof ProxyWallet>;

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
