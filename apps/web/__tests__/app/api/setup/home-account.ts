import { SecretJsHomeChainId } from "@obi-wallet/sdk";
import { serialize } from "@obi-wallet/sdk-json";
import { testApiHandler } from "next-test-api-route-handler";

test("/api/setup/home-account", async () => {
  // Make used fee lender deterministic by mocking Math.random
  jest.spyOn(Math, "random").mockReturnValue(0.1239);
  await testApiHandler({
    appHandler: await import("@/app/api/setup/home-account/route"),
    async test({ fetch }) {
      const response = await fetch({
        method: "POST",
        body: serialize({
          chainId: SecretJsHomeChainId.MAINNET,
        }),
      });
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchSnapshot({
        __test: {
          message: {
            msg: {
              new_account: {
                next_hash_seed: expect.any(String),
              },
            },
            msgEncrypted: expect.any(Object),
          },
        },
      });
    },
  });
});
