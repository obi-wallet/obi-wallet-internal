import {
  findByText,
  queryByText,
  waitForElementToBeRemoved,
} from "@storybook/test";

export interface UnitTestProps {
  done?: boolean;
  success?: boolean;
}

enum Status {
  InProgress = "Unit test in progress",
  Passed = "Unit test passed",
  Failed = "Unit test failed",
}

export function UnitTest({ done, success }: UnitTestProps) {
  const status = done
    ? success
      ? Status.Passed
      : Status.Failed
    : Status.InProgress;
  return <div>{status}</div>;
}

export async function unitTestPlay({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) {
  await waitForElementToBeRemoved(
    () => queryByText(canvasElement, Status.InProgress),
    {
      timeout: 10000,
    },
  );
  await findByText(canvasElement, Status.Passed);
}
