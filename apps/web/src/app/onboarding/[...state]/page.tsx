import { Onboarding } from "@/onboarding";
import {
  OnboardingFromType,
  OnboardingStep,
  OnboardingStepType,
} from "@/onboarding/onboarding-step";
import { notFound, redirect } from "next/navigation";
import { flatten, keys, times } from "ramda";

const flows: Record<string, OnboardingStep[]> = {
  internal: [
    { type: OnboardingStepType.UserData },
    { type: OnboardingStepType.PrimaryKey, from: OnboardingFromType.Internal },
    {
      type: OnboardingStepType.CreateWallet,
      waitUntilDone: true,
      redirectTo: "/dashboard",
    },
  ],
};

export async function generateStaticParams() {
  const flowKeys = keys(flows);

  return flatten(
    flowKeys.map((flowKey) => {
      const flow = flows[flowKey];
      if (!flow) return [];

      const steps = flow.length;
      return [
        {
          params: {
            state: [flow],
          },
        },
        ...times((step) => {
          return {
            params: {
              state: [flow, step],
            },
          };
        }, steps),
      ];
    }),
  );
}

export default async function OnboardingStateHandler(props: {
  params: Promise<{ state: string[] }>;
}) {
  const params = await props.params;
  const { state } = params;

  const flowKey = state[0];

  const flow = flowKey !== undefined ? flows[flowKey] : undefined;

  if (flow === undefined) {
    notFound();
  }

  const stepKey = state[1];
  const stepNumber = stepKey !== undefined ? parseInt(stepKey, 10) : undefined;

  if (stepNumber === undefined) {
    // No step provided, redirect to first step
    redirect(`${flowKey}/0`);
  }

  if (stepNumber >= flow.length) {
    notFound();
  }

  return (
    <Onboarding
      draftId={`onboarding-${flowKey}`}
      steps={flow}
      step={stepNumber}
    />
  );
}
