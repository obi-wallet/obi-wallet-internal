// eslint-disable-next-line import/no-extraneous-dependencies
export { expect } from "chai";

export type TestResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export type TestResults = Record<number, TestResult>;

export interface TestContext {
  test(name: string, fn: () => Promise<void>): void;
}

export function createTestSuite(fn: (context: TestContext) => void) {
  return fn;
}

export async function runTests(fn: (context: TestContext) => void) {
  const testResults: TestResults = {};
  let numberOfTests = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    const testIndex = numberOfTests++;

    try {
      await fn();
      console.log("✓", name);
      testResults[testIndex] = {
        success: true,
      };
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const error = e as Error;
      console.error("Test failed:", name);
      console.error(e);
      testResults[testIndex] = {
        success: false,
        error: error.message,
      };
    }
  };

  const waitForAllTestResults = async () => {
    let done = true;
    for (let i = 0; i < numberOfTests; i++) {
      done = done && !!testResults[i];
    }

    if (!done) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 100);
      });
      await waitForAllTestResults();
    }

    return testResults;
  };

  fn({ test });
  return await waitForAllTestResults();
}

export function hasSucceeded(result: TestResults) {
  return Object.values(result).every((result) => {
    return result.success;
  });
}
