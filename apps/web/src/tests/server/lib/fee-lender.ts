import { getFeeLender } from "@/lib/fee-lender";
import { createTestSuite, expect } from "@/tests";
import { SecretJsHomeChainId } from "@obi-wallet/sdk";

export const testSuite = createTestSuite(({ test }) => {
  test("getFeeLender", async () => {
    const { wallet } = getFeeLender(SecretJsHomeChainId.MAINNET, 0);
    expect(wallet.address).to.equal(
      "secret1qdvd79sfeeu825je2w9uzjuzw0whruvc5gcs58",
    );
  });
});
