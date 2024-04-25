import { runTests } from "@/tests";
import { ClientSideTests } from "@/tests/client";
import { testSuite } from "@/tests/server/lib/stackup";

export async function ServerSideTests() {
  const serverResults = await runTests((context) => {
    testSuite(context);
  });

  return <ClientSideTests serverResults={serverResults} />;
}
