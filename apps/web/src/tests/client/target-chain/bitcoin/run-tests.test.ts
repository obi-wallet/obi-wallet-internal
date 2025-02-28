/// <reference types="vitest" />
/// <vitest-environment happy-dom />

import { runTests } from "@/tests";
import { describe, expect, test } from "vitest";

import { testSuite as bitcoinMpcSignerTestSuite } from "./mpc-signer";
import { testSuite as bitcoinTokensTestSuite } from "./tokens";

describe("Bitcoin Tests", () => {
  test("Bitcoin MPC Signer Tests", async () => {
    const testResults = await runTests((context) => {
      bitcoinMpcSignerTestSuite(context);
    });
    expect(testResults).toBeDefined();
  });

  test("Bitcoin Tokens Tests", async () => {
    const testResults = await runTests((context) => {
      bitcoinTokensTestSuite(context);
    });
    expect(testResults).toBeDefined();
  });
});
