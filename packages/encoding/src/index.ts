import { z } from "zod";

export interface AbstractEncoding<T> {
  fromBytes(bytes: Uint8Array): T;
  toBytes(value: T): Uint8Array;
}

export const Base64 = z
  .string()
  .refine((str) => {
    return str === Buffer.from(str, "base64").toString("base64");
  })
  .brand("Base64");

export type Base64 = z.infer<typeof Base64>;

const base64Encoding: AbstractEncoding<Base64> = {
  fromBytes(bytes: Uint8Array) {
    return Base64.parse(Buffer.from(bytes).toString("base64"));
  },
  toBytes(base64: Base64) {
    return Uint8Array.from(Buffer.from(base64, "base64"));
  },
};

export const HexWithoutPrefix = z
  .string()
  .refine((str) => {
    return str === Buffer.from(str, "hex").toString("hex");
  })
  .brand("HexWithoutPrefix");

export type HexWithoutPrefix = z.infer<typeof HexWithoutPrefix>;

const hexWithoutPrefixEncoding: AbstractEncoding<HexWithoutPrefix> = {
  fromBytes(bytes: Uint8Array) {
    return HexWithoutPrefix.parse(Buffer.from(bytes).toString("hex"));
  },
  toBytes(hex: HexWithoutPrefix) {
    return Uint8Array.from(Buffer.from(hex, "hex"));
  },
};

export const HexWithPrefix = z
  .string()
  .refine((str): str is `0x${string}` => {
    return str === `0x${Buffer.from(str.substring(2), "hex").toString("hex")}`;
  })
  .brand("HexWithPrefix");

export type HexWithPrefix = z.infer<typeof HexWithPrefix>;

const hexWithPrefixEncoding: AbstractEncoding<HexWithPrefix> = {
  fromBytes(bytes: Uint8Array) {
    return HexWithPrefix.parse(`0x${Buffer.from(bytes).toString("hex")}`);
  },
  toBytes(hex: HexWithPrefix) {
    return Uint8Array.from(Buffer.from(hex.substring(2), "hex"));
  },
};

export function concat(...args: Base64[]): Base64;
export function concat(...args: HexWithoutPrefix[]): HexWithoutPrefix;
export function concat(...args: string[]): string {
  return args.join("");
}

export class Encoding {
  protected constructor(protected bytes: Uint8Array) {}

  public toBytes() {
    return this.bytes;
  }

  public toBase64() {
    return base64Encoding.fromBytes(this.bytes);
  }

  public toHexWithoutPrefix() {
    return hexWithoutPrefixEncoding.fromBytes(this.bytes);
  }

  public toHexWithPrefix() {
    return hexWithPrefixEncoding.fromBytes(this.bytes);
  }

  public static fromBytes(bytes: Uint8Array) {
    return new Encoding(bytes);
  }

  public static fromBase64(base64: Base64) {
    return new Encoding(base64Encoding.toBytes(base64));
  }

  public static fromHexWithoutPrefix(hex: HexWithoutPrefix) {
    return new Encoding(hexWithoutPrefixEncoding.toBytes(hex));
  }

  public static fromHexWithPrefix(hex: HexWithPrefix) {
    return new Encoding(hexWithPrefixEncoding.toBytes(hex));
  }
}
