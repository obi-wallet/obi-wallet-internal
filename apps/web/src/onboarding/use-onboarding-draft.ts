import { useStore } from "@/contexts";
import { NewOnboardingPayload } from "@/onboarding/new-onboarding-payload";
import { useEffect } from "react";

export function useOnboardingDraft({ draftId }: { draftId: string }) {
  const { chainStore, draftsStore } = useStore();
  const draft = draftsStore.get<NewOnboardingPayload>({ id: draftId });

  useEffect(() => {
    if (!draft) {
      draftsStore.create({
        id: draftId,
        original: new NewOnboardingPayload(chainStore.currentChain),
      });
    }
  }, [chainStore.currentChain, draft, draftId, draftsStore]);

  return draft;
}
