import {
  KeyFlow,
  KeyRoute,
  OnboardingRoute,
  useRootNavigation,
} from "@obi-wallet/common";
import { CommonActions } from "@react-navigation/native";
import { useEffect } from "react";

import { BaseAppWithoutProvider } from "../../src/app";
import { MultisigDraft } from "../../src/fixture-helpers";

const commonParams = {
  draftId: MultisigDraft.draftId,
  flow: KeyFlow.CreateWallet,
  demoMode: true,
};

const routes = [
  {
    name: OnboardingRoute.Welcome,
  },
  {
    name: KeyRoute.DeviceKey,
    params: commonParams,
  },
  {
    name: KeyRoute.PhoneKeyRequest,
    params: commonParams,
  },
  {
    name: KeyRoute.PhoneKeyConfirm,
    params: {
      ...commonParams,
      phoneNumber: "+123456789",
      securityQuestion: "birthplace",
      securityAnswer: "Wonderland",
    },
  },
  {
    name: OnboardingRoute.CreateWallet,
    params: commonParams,
  },
];

function Step({ step }: { step: number }) {
  return (
    <MultisigDraft.Container>
      <StepInner step={step} />
    </MultisigDraft.Container>
  );
}

function StepInner({ step }: { step: number }) {
  const navigation = useRootNavigation();
  useEffect(() => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: routes.slice(0, step + 1),
      }),
    );
  }, [step, navigation]);

  return <BaseAppWithoutProvider />;
}

export default {
  "Step 1: Welcome": <Step step={0} />,
  "Step 2: Device Key": <Step step={1} />,
  "Step 3: Phone Key Request": <Step step={2} />,
  "Step 4: Phone Key Confirm": <Step step={3} />,
  "Step 5: Create Wallet": <Step step={4} />,
};
