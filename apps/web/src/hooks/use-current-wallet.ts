import { useStore } from "@/contexts";

export function useCurrentWallet() {
  const { mpcWalletsStore } = useStore();
  return mpcWalletsStore.currentWallet;
}
