import { runTests } from "@/tests";
import { ClientSideTests } from "@/tests/client";
import { testSuite as feeLenderTestSuite } from "@/tests/server/lib/fee-lender";
import { testSuite as stackupTestSuite } from "@/tests/server/lib/stackup";
import { notFound } from "next/navigation";

export async function ServerSideTests() {
  // Disable route in production (but allow in preview deployments) to prevent waste of infrastructure resources
  // We might want to make this an authenticated route in the future
  if (process.env.VERCEL_ENV === "production") return notFound();

  const serverResults = await runTests((context) => {
    feeLenderTestSuite(context);
    stackupTestSuite(context);
  });

  return <ClientSideTests serverResults={serverResults} />;
}
