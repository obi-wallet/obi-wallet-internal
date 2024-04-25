import { SecretJsHomeChainId } from "@obi-wallet/sdk";
import { testApiHandler } from "next-test-api-route-handler";

test("/api/setup/home-account", async () => {
  await testApiHandler({
    appHandler: await import("@/app/api/setup/home-account/route"),
    async test({ fetch }) {
      const response = await fetch({
        method: "POST",
        body: JSON.stringify({
          chainId: SecretJsHomeChainId.MAINNET,
        }),
      });
      expect(response.status).toBe(200);
      const { ownerAddress, homeAccountAddress, txResult, ownerIndex } =
        await response.json();
      expect(typeof ownerAddress).toEqual("string");
      expect(typeof ownerIndex).toEqual("number");
      expect({
        homeAccountAddress,
        txResult,
      }).toMatchSnapshot();
    },
  });
});
