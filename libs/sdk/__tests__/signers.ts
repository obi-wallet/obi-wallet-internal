import { MsgSend } from "@terra-money/feather.js";

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

  describe("prepareSigner", () => {
    test("Cosmos", async () => {
      await Sdk.chainId("juno-1").prepareSigner({ signer });
    });

    test("Terra", async () => {
      await Sdk.chainId("phoenix-1").prepareSigner({ signer });
    });
  });

  describe("createAndSignTransaction", () => {
    describe("Cosmos", () => {
      test("Successful MsgSend", async () => {
        const sdk = Sdk.chainId("juno-1");
        const address = sdk.getAddressOfSigner({ signer });
        const message = new MsgSend(address, address, { ujuno: 1 });
        const transaction = await sdk.createAndSignTransaction({
          signer,
          messages: [message],
        });
        expect(transaction).toBeInstanceOf(Uint8Array);
      });

      test("Failed MsgSend", async () => {
        const sdk = Sdk.chainId("juno-1");
        const address = sdk.getAddressOfSigner({ signer });
        const message = new MsgSend(address, address, { invalid: 1 });
        await expect(
          sdk.createAndSignTransaction({
            signer,
            messages: [message],
          })
        ).rejects.toMatchObject({
          message: expect.stringMatching(/0invalid is smaller than 1invalid/),
        });
      });
    });

    describe("Terra", () => {
      test("Successful MsgSend", async () => {
        const sdk = Sdk.chainId("phoenix-1");
        const address = sdk.getAddressOfSigner({ signer });
        const message = new MsgSend(address, address, { uluna: 1 });
        const transaction = await sdk.createAndSignTransaction({
          signer,
          messages: [message],
        });
        expect(transaction).toBeInstanceOf(Uint8Array);
      });

      test("Failed MsgSend", async () => {
        const sdk = Sdk.chainId("phoenix-1");
        const address = sdk.getAddressOfSigner({ signer });
        const message = new MsgSend(address, address, { invalid: 1 });
        await expect(
          sdk.createAndSignTransaction({
            signer,
            messages: [message],
          })
        ).rejects.toMatchObject({
          message: expect.stringMatching(/0invalid is smaller than 1invalid/),
        });
      });
    });
  });
});
