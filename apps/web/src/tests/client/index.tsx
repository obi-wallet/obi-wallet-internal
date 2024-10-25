"use client";

import { Text } from "@/components";
import { hasSucceeded, runTests, TestResults } from "@/tests";
import { testSuite as cosmosTokensTestSuite } from "@/tests/client/target-chain/cosmos-sdk/tokens";
import { testSuite as evmTokensTestSuite } from "@/tests/client/target-chain/evm/tokens";
import { testSuite as secretTestSuite } from "@/tests/client/target-chain/secret/target-chain";
import { testSuite as approveMessagesTestSuite } from "@/tests/client/user-interactions/approve-messages";
import { AsyncButton } from "@/ui/button";
import { useCallback, useEffect, useState } from "react";
import { useEffectOnceWhen } from "rooks";

export function ClientSideTests({
  serverResults,
}: {
  serverResults: TestResults;
}) {
  const [clientResults, setClientResults] = useState<TestResults | null>(null);
  const runClientTests = useCallback(async () => {
    setClientResults(null);
    const clientResults = await runTests((context) => {
      cosmosTokensTestSuite(context);
      evmTokensTestSuite(context);
      secretTestSuite(context);
      approveMessagesTestSuite(context);
    });
    setClientResults(clientResults);
  }, [setClientResults]);

  useEffect(() => {
    const listener = async (event: KeyboardEvent) => {
      if (event.key === "r") {
        await runClientTests();
      }
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [runClientTests]);

  useEffectOnceWhen(async () => {
    await runClientTests();
  });

  const serverSuccess = hasSucceeded(serverResults);
  const clientSuccess = clientResults && hasSucceeded(clientResults);

  return (
    <div>
      <Text>
        {clientResults ? (
          <span id="test-results" className="hidden">
            {serverSuccess && clientSuccess ? "success" : "failure"}
          </span>
        ) : null}
        <br />
        Client:{" "}
        {clientResults ? (clientSuccess ? "success" : "failure") : "pending"}
        <br />
        Server: {serverSuccess ? "success" : "failure"}
      </Text>
      <AsyncButton onClick={runClientTests}>Run client tests (R)</AsyncButton>
    </div>
  );
}
