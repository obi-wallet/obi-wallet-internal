import { generateEthereumAddresses } from "@/lib/stackup";
import { createTestSuite, expect } from "@/tests";
import { Secp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";

export const testSuite = createTestSuite(({ test }) => {
  test("generateEthereumAddresses", async () => {
    const keyPair: Secp256k1KeyPair = {
      privateKey: "cM3ziz/IfwzE+uje6dW+UBUW7j6jlTjfvBGTQzoeV6M=",
      publicKey: {
        type: "tendermint/PubKeySecp256k1",
        value: "AgVK56wekxPMnZJWcAIakU+oplFHOdrATkTZyZ3Bg3SC",
      },
    };
    expect(await generateEthereumAddresses(keyPair.publicKey)).to.deep.equal({
      evmSigningAddress: "0x4457A34a0a04a40c46462aed5D444C5eA5D9DC28",
      evmSimpleAccountAddress: "0xc571607fcf2Cc230C9a9c1c490239Df81Bf0F9C6",
    });
  });
});
