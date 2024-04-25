import { generateEthereumAddresses } from "@/lib/stackup";
import { Secp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";

test("generateEthereumAddresses", async () => {
  const keyPair: Secp256k1KeyPair = {
    privateKey: "cM3ziz/IfwzE+uje6dW+UBUW7j6jlTjfvBGTQzoeV6M=",
    publicKey: {
      type: "tendermint/PubKeySecp256k1",
      value: "AgVK56wekxPMnZJWcAIakU+oplFHOdrATkTZyZ3Bg3SC",
    },
  };
  expect(await generateEthereumAddresses(keyPair.publicKey)).toMatchSnapshot();
});
