import { setupWalletConnect } from "../src";

test("foo", async () => {
  const wallet = await setupWalletConnect({
    projectId: "foo",
    metadata: {
      name: "foo",
      description: "foo",
      url: "foo",
      icons: [],
    },
  });
  if (wallet.core.relayer.connected) {
    await wallet.core.relayer.transportClose();
  }
});
