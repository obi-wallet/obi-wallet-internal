import { Sdk, Secp256k1KeyPair, Secp256k1PrivateKeySigner } from "../src";

const keyPair: Secp256k1KeyPair = {
  publicKey: {
    type: "tendermint/PubKeySecp256k1",
    value: "A4TlI8UUTtpSI+oZ9q0dnXJoK9GiE/iMoy5cdMO2HNTI",
  },
  privateKey: "jrfHogEDo91xaC0Kym/BMheAhlm5z93fVwMT8mKTGy4=",
};

describe("Sec256k1PrivateKeySigner", () => {
  let signer: Secp256k1PrivateKeySigner;

  beforeEach(() => {
    signer = new Secp256k1PrivateKeySigner(keyPair.privateKey);
  });

  describe("Prepare signer", () => {
    test("Cosmos", async () => {
      await Sdk.chainId("juno-1").prepareSigner({ signer });
    });

    test("Terra", async () => {
      await Sdk.chainId("phoenix-1").prepareSigner({ signer });
    });
  });
});
