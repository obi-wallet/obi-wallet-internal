import { SimplePublicKey } from "@terra-money/feather.js";

import { AccountValidationResult, Sdk, generateSec256k1KeyPair } from "../src";

describe("validateAccount", () => {
  const demoPublicKey = SimplePublicKey.fromAmino({
    type: "tendermint/PubKeySecp256k1",
    value: "A4TlI8UUTtpSI+oZ9q0dnXJoK9GiE/iMoy5cdMO2HNTI",
  });
  const notReadyPublicKey = SimplePublicKey.fromAmino(
    generateSec256k1KeyPair().publicKey
  );

  describe("Cosmos", () => {
    const sdk = Sdk.chainId("juno-1");

    test("Invalid Address", async () => {
      expect(
        await sdk.validateAccount({
          address: "invalid",
        })
      ).toEqual(AccountValidationResult.INVALID_ADDRESS);
      expect(
        await sdk.validateAccount({
          address: demoPublicKey.address("terra"),
        })
      ).toEqual(AccountValidationResult.INVALID_ADDRESS);
    });

    test("Account not ready", async () => {
      expect(
        await sdk.validateAccount({
          address: notReadyPublicKey.address("juno"),
        })
      ).toEqual(AccountValidationResult.ACCOUNT_NOT_READY);
    });

    test("Public key not ready", async () => {
      expect(
        await sdk.validateAccount({
          address:
            "juno1utkr0ep06rkxgsesq6uryug93daklyd6wneesmtvxjkz0xjlte9qdj2s8q",
        })
      ).toEqual(AccountValidationResult.PUBLIC_KEY_NOT_READY);
    });

    test("Ready", async () => {
      expect(
        await sdk.validateAccount({
          address: demoPublicKey.address("juno"),
        })
      ).toEqual(AccountValidationResult.READY);
    });
  });

  describe("Terra", () => {
    const sdk = Sdk.chainId("phoenix-1");

    test("Invalid Address", async () => {
      expect(
        await sdk.validateAccount({
          address: "invalid",
        })
      ).toEqual(AccountValidationResult.INVALID_ADDRESS);
      expect(
        await sdk.validateAccount({
          address: demoPublicKey.address("juno"),
        })
      ).toEqual(AccountValidationResult.INVALID_ADDRESS);
    });

    test("Account not ready", async () => {
      expect(
        await sdk.validateAccount({
          address: notReadyPublicKey.address("terra"),
        })
      ).toEqual(AccountValidationResult.ACCOUNT_NOT_READY);
    });

    test("Public key not ready", async () => {
      expect(
        await sdk.validateAccount({
          address:
            "terra196qq8jrfpmxcf7d3cy7th9k25l3s9v8uzy9wzvf0xqkxkmw4rrnqkwgazv",
        })
      ).toEqual(AccountValidationResult.PUBLIC_KEY_NOT_READY);
    });

    test("Ready", async () => {
      expect(
        await sdk.validateAccount({
          address: demoPublicKey.address("terra"),
        })
      ).toEqual(AccountValidationResult.READY);
    });
  });
});

describe("fetchPrices", () => {
  test("Cosmos", async () => {
    const result = await Sdk.chainId("juno-1").fetchPrices();
    expect(typeof result["ujuno"]).toEqual("number");
  });

  test("Terra", async () => {
    const result = await Sdk.chainId("phoenix-1").fetchPrices();
    expect(typeof result["uluna"]).toEqual("number");
  });
});
