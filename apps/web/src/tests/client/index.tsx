"use client";

import { Text } from "@/components";
import { hasSucceeded, runTests, TestResults } from "@/tests";
import { useState } from "react";
import { useEffectOnceWhen } from "rooks";

export function ClientSideTests({
  serverResults,
}: {
  serverResults: TestResults;
}) {
  const [clientResults, setClientResults] = useState<TestResults | null>(null);

  useEffectOnceWhen(async () => {
    const clientResults = await runTests(() => {});
    setClientResults(clientResults);
  });

  const serverSuccess = hasSucceeded(serverResults);
  const clientSuccess = clientResults && hasSucceeded(clientResults);

  return (
    <Text>
      {clientResults ? (
        <span id="test-results" className="hidden">
          {serverSuccess && clientSuccess ? "success" : "failure"}
        </span>
      ) : null}
      Server: {serverSuccess ? "success" : "failure"}
      <br />
      Client:{" "}
      {clientResults ? (clientSuccess ? "success" : "failure") : "pending"}
    </Text>
  );
}
