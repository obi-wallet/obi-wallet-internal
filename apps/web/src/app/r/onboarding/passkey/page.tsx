"use client";

import { Button, ButtonLink, Stepper, Text } from "@/components";
import { useOnboardingDraft } from "@/onboarding/use-onboarding-draft";
import { getOrCreatePasskey, Sdk } from "@obi-wallet/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/navigation";
import invariant from "tiny-invariant";

export default observer(function Passkey() {
  const draft = useOnboardingDraft();
  const queryClient = useQueryClient();
  const router = useRouter();

  if (!draft) return null;

  // TODO: these depend on whether the user already has keys or not
  // If no keys = step 3
  // If at least one key = step 4
  const currentStep = 3;
  const previous = "/r/onboarding/step3";
  const next = "/r/onboarding/step4";

  async function flow({
    userSaysDeviceIsNew,
  }: {
    userSaysDeviceIsNew: boolean;
  }) {
    // TODO: not sure if we even need that differentation
    const _userSaysDeviceIsNew = userSaysDeviceIsNew;

    invariant(draft, "Draft must exist");

    const result = await getOrCreatePasskey();
    if (!result.success) return result;

    const { keyPair } = result;
    await draft.value.multisigKey.setDeviceKey(keyPair);
    await queryClient.prefetchQuery(
      Sdk.chainId(
        draft.value.multisigKey.chainId,
      ).transactions.prepareKeyPairQuery(keyPair),
    );
    router.push(next);
  }

  return (
    <section className="flex flex-col items-center space-y-7">
      <Stepper currentStep={currentStep} />
      <Text fontWeight="bold" size="3xl">
        Create a Passkey
      </Text>

      <Button
        className="block w-full"
        variant="primary"
        onClick={() => {
          void flow({
            userSaysDeviceIsNew: true,
          });
        }}
      >
        Create a New Passkey
      </Button>

      <Button
        className="block w-full"
        variant="primary"
        onClick={() => {
          void flow({
            userSaysDeviceIsNew: false,
          });
        }}
      >
        I've Used This Device
      </Button>

      <ButtonLink href={previous} className="block w-full" variant="outline">
        Back
      </ButtonLink>
    </section>
  );
});
