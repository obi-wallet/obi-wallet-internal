"use client";

import { Text } from "@/components";
import { hasSucceeded, runTests, TestResults } from "@/tests";
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
