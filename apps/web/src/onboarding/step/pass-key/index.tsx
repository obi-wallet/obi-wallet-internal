"use client";

import { Button, Text } from "@/components";
import { StepProps } from "@/onboarding/step";
import { getOrCreatePasskey, KeyType, Sdk } from "@obi-wallet/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { observer } from "mobx-react-lite";
import invariant from "tiny-invariant";

export const PasskeyStep = observer(function PasskeyStep({
  draft,
  back,
  next,
}: StepProps) {
  const queryClient = useQueryClient();

  async function flow({
    userSaysDeviceIsNew,
  }: {
    userSaysDeviceIsNew: boolean;
  }) {
    invariant(draft, "Draft must exist");

    const result = await getOrCreatePasskey();
    if (!result.success) return result;

    const { keyPair } = result;
    await draft.value.setPrimaryKey({
      key: {
        type: KeyType.Device,
        payload: keyPair,
      },
      userSaysDeviceIsNew,
    });
    await queryClient.prefetchQuery(
      Sdk.chainId(draft.value.chainId).transactions.prepareKeyPairQuery(
        keyPair,
      ),
    );
    if (next) next();
  }

  return (
    <>
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

      <Button onClick={back} className="block w-full" variant="outline">
        Back
      </Button>
    </>
  );
});
