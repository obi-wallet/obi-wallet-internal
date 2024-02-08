import { Button } from "@/components";

export interface OnboardingButtonsProps {
  back?: () => void;
  next?: () => void;
  nextLabel: string;
  nextDisabled?: boolean;
}

export function OnboardingButtons({
  back,
  next,
  nextLabel,
  nextDisabled,
}: OnboardingButtonsProps) {
  const nextButton = (
    <Button
      onClick={next}
      className="block w-full"
      variant="primary"
      disabled={nextDisabled}
    >
      {nextLabel}
    </Button>
  );

  if (back) {
    return (
      <div className="grid w-full grid-cols-2 gap-6">
        <Button className="block w-full" variant="outline" onClick={back}>
          Back
        </Button>
        {nextButton}
      </div>
    );
  }

  return nextButton;
}
