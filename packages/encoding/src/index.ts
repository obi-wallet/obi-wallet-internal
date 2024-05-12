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

export const Hex = z
  .string()
  .refine((str) => {
    return str === Buffer.from(str, "hex").toString("hex");
  })
  .brand("HexWithoutPrefix");

export type Hex = z.infer<typeof Hex>;

const hexEncoding: AbstractEncoding<Hex> = {
  fromBytes(bytes: Uint8Array) {
    return Hex.parse(Buffer.from(bytes).toString("hex"));
  },
  toBytes(hex: Hex) {
    return Uint8Array.from(Buffer.from(hex, "hex"));
  },
};

export const PrefixedHex = z
  .string()
  .refine((str): str is `0x${string}` => {
    return str === `0x${Buffer.from(str.substring(2), "hex").toString("hex")}`;
  })
  .brand("HexWithPrefix");

export type PrefixedHex = z.infer<typeof PrefixedHex>;

const prefixedHexEncoding: AbstractEncoding<PrefixedHex> = {
  fromBytes(bytes: Uint8Array) {
    return PrefixedHex.parse(`0x${Buffer.from(bytes).toString("hex")}`);
  },
  toBytes(hex: PrefixedHex) {
    return Uint8Array.from(Buffer.from(hex.substring(2), "hex"));
  },
};

export class Encoding {
  protected constructor(protected bytes: Uint8Array) {}

  public toBytes() {
    return this.bytes;
  }

  public toBase64() {
    return base64Encoding.fromBytes(this.bytes);
  }

  public toHex() {
    return hexEncoding.fromBytes(this.bytes);
  }

  public toPrefixedHex() {
    return prefixedHexEncoding.fromBytes(this.bytes);
  }

  public static fromBytes(bytes: Uint8Array) {
    return new Encoding(bytes);
  }

  public static fromBase64(base64: Base64) {
    return new Encoding(base64Encoding.toBytes(base64));
  }

  public static fromHex(hex: Hex) {
    return new Encoding(hexEncoding.toBytes(hex));
  }

  public static fromPrefixedHex(hex: PrefixedHex) {
    return new Encoding(prefixedHexEncoding.toBytes(hex));
  }

  public static concat(...args: Encoding[]): Encoding {
    let combinedLength = 0;
    args.forEach((item) => {
      combinedLength += item.toBytes().length;
    });

    const bytes = new Uint8Array(combinedLength);
    let offset = 0;
    args.forEach((item) => {
      bytes.set(item.toBytes(), offset);
      offset += item.toBytes().length;
    });

    return new Encoding(bytes);
  }
}
