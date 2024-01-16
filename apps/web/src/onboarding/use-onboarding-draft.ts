import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { OnboardingPayload } from "@/onboarding/onboarding-payload";
import { useEffect } from "react";

export function useOnboardingDraft({ draftId }: { draftId: string }) {
  useCurrentWallet({ redirectTo: "/dashboard", redirectIfFound: true });
  const { chainStore, draftsStore } = useStore();
  const draft = draftsStore.get<OnboardingPayload>({ id: draftId });

  useEffect(() => {
    if (!draft) {
      draftsStore.create({
        id: draftId,
        original: new OnboardingPayload(chainStore.currentChain),
      });
    }
  }, [chainStore.currentChain, draft, draftId, draftsStore]);

  return draft;
}
