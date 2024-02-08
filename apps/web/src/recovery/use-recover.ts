import { useStore } from "@/contexts";
import { MultisigKey } from "@obi-wallet/sdk";
import { z } from "zod";

export const ProxyWallet = z.object({
  proxyAddress: z.object({
    address: z.string(),
  }),
  owner: z.object({
    threshold: z.string(),
    // TODO: here we should probably be more specific regarding the structure of `keys`, review /add logic and make sure the schema usage is consistent here.
    keys: z.array(z.unknown()),
  }),
  userData: z.object({
    name: z.string(),
    avatar: z.string(),
  }),
  encryptedBackupShare: z.string(),
});

export type ProxyWallet = z.TypeOf<typeof ProxyWallet>;

export function useRecover() {
  const { mpcWalletsStore } = useStore();

  async function recover({
    account,
  }: {
    multisigKey: MultisigKey;
    account: ProxyWallet;
  }) {
    const wallet = mpcWalletsStore.getWalletByUserEntryAddress(
      account.proxyAddress.address,
    );
    if (wallet) {
      mpcWalletsStore.setCurrentWallet(wallet);
    } else {
      window.alert("Recovery not implemented yet");
      // TODO:
      // await mpcWalletsStore.createWallet({
      //   multisigKey,
      //   demoMode: false,
      //   skipInit: true,
      //   homeAccountAddressOverride: account.proxyAddress.address,
      //   evmSigningAddressOverride: "",
      //   evmUserContractAddressOverride: "",
      // });
    }
  }

  return recover;
}
