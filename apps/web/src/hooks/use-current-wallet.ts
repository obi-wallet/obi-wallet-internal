import { useStore } from "@/contexts";
import { WalletState } from "@obi-wallet/headless-ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useCurrentWallet({
  redirectTo,
  redirectIfFound,
}: {
  redirectTo?: string;
  redirectIfFound?: boolean;
}) {
  const { mpcWalletsStore, walletsStoreState } = useStore();
  const router = useRouter();
  const currentWallet = mpcWalletsStore.currentWallet;

  useEffect(() => {
    // if no redirect needed, just return
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || walletsStoreState !== WalletState.READY) return;

    if (
      // If redirectTo is set, redirect if no current wallet is set
      (redirectTo && !redirectIfFound && !currentWallet) ||
      // If redirectIfFound is also set, redirect if current wallet is set
      (redirectIfFound && currentWallet)
    ) {
      void router.push(redirectTo);
    }
  }, [currentWallet, redirectIfFound, redirectTo, router, walletsStoreState]);

  return currentWallet;
}
