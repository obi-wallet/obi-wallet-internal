import * as JSON from "@obi-wallet/sdk-json";

test("should serialize and deserialize BigInt", () => {
  const value = {
    someBigInt: 100n,
  };

  expect(JSON.deserialize(JSON.serialize(value))).toEqual(value);
  expect(typeof JSON.deserialize(JSON.serialize(value)).someBigInt).toEqual(
    "bigint",
  );
});
