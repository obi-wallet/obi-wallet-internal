import { hasSucceeded, runTests } from "@/tests";
import { testSuite as bitcoinMpcSignerTestSuite } from "./mpc-signer";
import { testSuite as bitcoinTokensTestSuite } from "./tokens";

async function main() {
  const testResults = await runTests((context) => {
    bitcoinMpcSignerTestSuite(context);
  });

  if (hasSucceeded(testResults)) {
    console.log("All tests passed!");
    process.exit(0);
  } else {
    console.error("Some tests failed.");
    console.error(testResults);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Error running tests:", error);
  process.exit(1);
});