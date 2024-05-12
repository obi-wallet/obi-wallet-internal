import { computeEthereumAddress } from "@/lib/stackup";
import { createTestSuite, expect } from "@/tests";
import { Secp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";

export const testSuite = createTestSuite(({ test }) => {
  test("generateEthereumAddresses", async () => {
    const keyPair = Secp256k1KeyPair.parse({
      privateKey: "cM3ziz/IfwzE+uje6dW+UBUW7j6jlTjfvBGTQzoeV6M=",
      publicKey: {
        type: "tendermint/PubKeySecp256k1",
        value: "AgVK56wekxPMnZJWcAIakU+oplFHOdrATkTZyZ3Bg3SC",
      },
    });
    expect(computeEthereumAddress(keyPair.publicKey)).to.equal(
      "0x4457A34a0a04a40c46462aed5D444C5eA5D9DC28",
    );
  });
});
