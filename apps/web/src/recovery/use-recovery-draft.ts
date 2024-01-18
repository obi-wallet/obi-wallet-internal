import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { RecoveryPayload } from "@/recovery/recovery-payload";
import { useEffect } from "react";

export function useRecoveryDraft() {
  useCurrentWallet({ redirectTo: "/dashboard", redirectIfFound: true });
  const { chainStore, draftsStore } = useStore();
  const draft = draftsStore.get<RecoveryPayload>({ id: "recovery" });

  useEffect(() => {
    if (!draft) {
      draftsStore.create({
        id: "recovery",
        original: new RecoveryPayload(chainStore.currentChain),
      });
    }
  }, [chainStore.currentChain, draft, draftsStore]);

  return draft;
}
