import { TOSModal } from "@/components/modals/tos";
import { Onboarding } from "@/onboarding";

export default async function OnboardingStateHandler() {
  return (
    <>
      <Onboarding />
      <TOSModal />
    </>
  );
}
