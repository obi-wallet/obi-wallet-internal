import { BitButton } from "@/components/buttons/8bit-button";

export interface OnboardingButtonsProps {
  back?: () => void;
  next?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}

export function OnboardingButtons({
  back,
  next,
  nextLabel = "Continue",
  nextDisabled,
}: OnboardingButtonsProps) {
  const nextButton = (
    <BitButton onClick={next} className="block w-full" disabled={nextDisabled}>
      {nextLabel}
    </BitButton>
  );

  return (
    <div className="flex flex-col gap-6">
      {next && (
        <BitButton onClick={next} disabled={nextDisabled}>
          {nextLabel}
        </BitButton>
      )}
      {back && <BitButton onClick={back}>Back</BitButton>}
    </div>
  );
}
