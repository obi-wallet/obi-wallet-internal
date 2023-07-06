import { faker } from "@faker-js/faker";
import { isObservable, isObservableProp } from "mobx";
import * as secp256k1 from "secp256k1";
import invariant from "tiny-invariant";

export function expectIsPureObject(serialized: unknown) {
  expect(isObservable(serialized)).toEqual(false);
  JSON.stringify(serialized, function (key, value) {
    invariant(!isObservableProp(this, key), `Key ${key} is observable prop`);
    invariant(!isObservable(value), `Key ${key} is observable`);
    return value;
  });
}

export function generateSec256k1KeyPair() {
  const privateKeyBuffer = Buffer.from(faker.random.alphaNumeric(32), "utf-8");
  const publicKeyBuffer = secp256k1.publicKeyCreate(privateKeyBuffer);

  const privateKey = Buffer.from(privateKeyBuffer).toString("base64");
  const publicKey = Buffer.from(publicKeyBuffer).toString("base64");

  return {
    privateKey,
    publicKey: {
      type: "tendermint/PubKeySecp256k1" as const,
      value: publicKey,
    },
  };
}
