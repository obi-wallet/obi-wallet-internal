import { runTests } from "@/tests";
import { testSuite as bitcoinMpcSignerTestSuite } from "./mpc-signer";
import { testSuite as bitcoinTokensTestSuite } from "./tokens";
import { expect } from '@jest/globals';

describe("Bitcoin Tests", () => {
  test("Bitcoin MPC Signer Tests", async () => {
    const testResults = await runTests((context) => {
      bitcoinMpcSignerTestSuite(context);
    });
    expect(testResults).toBeDefined();
    // You can add more specific assertions if needed
  });

  test("Bitcoin Tokens Tests", async () => {
    const testResults = await runTests((context) => {
      bitcoinTokensTestSuite(context);
    });
    expect(testResults).toBeDefined();
    // Additional assertions
  });
});