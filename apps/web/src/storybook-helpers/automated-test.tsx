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
  return <div>{status}</div>;
}

export async function automatedTestPlay({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) {
  await waitFor(
    () => {
      return queryAllByText(canvasElement, Status.InProgress).length === 0;
    },
    {
      timeout: 10000,
    },
  );
  await findByText(canvasElement, Status.Passed);
}
