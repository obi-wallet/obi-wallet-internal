import { has } from "ramda";

export interface SerializedBigInt {
  __type: "bigint";
  __value: string;
}

export function isSerializedBigInt(value: unknown): value is SerializedBigInt {
  return (
    has("__type", value) &&
    value.__type === "bigint" &&
    has("__value", value) &&
    typeof value.__value === "string"
  );
}

export function serializeBigInt(value: bigint): SerializedBigInt {
  return {
    __type: "bigint",
    __value: value.toString(),
  };
}

export function deserializeBigInt(value: SerializedBigInt): bigint {
  return BigInt(value.__value);
}

export function serialize(object: unknown) {
  return JSON.stringify(object, (key, value) => {
    if (typeof value === "bigint") {
      return serializeBigInt(value);
    }

    return value;
  });
}

export function deserialize(json: string) {
  return JSON.parse(json, (key, value) => {
    if (isSerializedBigInt(value)) {
      return deserializeBigInt(value);
    }

    return value;
  });
}
