"use client";

import { Button, ButtonLink, Stepper, Text } from "@/components";
import { useOnboardingDraft } from "@/onboarding/use-onboarding-draft";
import { observer } from "mobx-react-lite";

export default observer(function Passkey() {
  const draft = useOnboardingDraft();

  if (!draft) return null;

  // TODO: these depend on whether the user already has keys or not
  // If no keys = step 3
  // If at least one key = step 4
  const currentStep = 3;
  const previous = "/r/onboarding/step3";
  const _next = "/r/onboarding/step4";

  return (
    <section className="flex flex-col items-center space-y-7">
      <Stepper currentStep={currentStep} />
      <Text fontWeight="bold" size="3xl">
        Create a Passkey
      </Text>

      <Button className="block w-full" variant="primary">
        Create a New Passkey
      </Button>

      <Button className="block w-full" variant="primary">
        I've Used This Device
      </Button>

      <ButtonLink href={previous} className="block w-full" variant="outline">
        Back
      </ButtonLink>
    </section>
  );
});
