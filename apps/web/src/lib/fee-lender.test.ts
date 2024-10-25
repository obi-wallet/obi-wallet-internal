import { getFeeLender } from "@/lib/fee-lender";
import { SecretJsHomeChainId } from "@obi-wallet/sdk";
import { expect, test } from "vitest";

test("getFeeLender", async () => {
  const { wallet } = getFeeLender(SecretJsHomeChainId.MAINNET, 0);
  expect(wallet.address).toEqual(
    "secret1qdvd79sfeeu825je2w9uzjuzw0whruvc5gcs58",
  );
});
