import { findByText, queryAllByText, waitFor } from "@storybook/test";

export interface UnitTestProps {
  done?: boolean;
  success?: boolean;
}

enum Status {
  InProgress = "Automated test in progress",
  Passed = "Automated test passed",
  Failed = "Automated test failed",
}

export function AutomatedTest({ done, success }: UnitTestProps) {
  const status = done
    ? success
      ? Status.Passed
      : Status.Failed
    : Status.InProgress;
  return <div className="text-white">{status}</div>;
}

export async function automatedTestPlay({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) {
  await waitFor(
    () => {
      if (queryAllByText(canvasElement, Status.InProgress).length !== 0) {
        throw new Error("Test is still in progress");
      }
    },
    {
      timeout: 60000,
    },
  );
  await findByText(canvasElement, Status.Passed);
}
