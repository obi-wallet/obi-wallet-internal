import { z } from "zod";

export interface AbstractEncoding<T> {
  fromBytes(bytes: Uint8Array): T;
  toBytes(value: T): Uint8Array;
}

function createBufferSchema<T extends BufferEncoding>(bufferEncoding: T) {
  const schema = z
    .string()
    .refine((str) => {
      // Only validate during runtime in development
      if (process.env.NODE_ENV === "production") {
        return true;
      }
      return str === Buffer.from(str, bufferEncoding).toString(bufferEncoding);
    })
    .brand(bufferEncoding);
  const encoding: AbstractEncoding<z.infer<typeof schema>> = {
    fromBytes(bytes: Uint8Array) {
      return schema.parse(Buffer.from(bytes).toString(bufferEncoding));
    },
    toBytes(value: z.infer<typeof schema>) {
      return Uint8Array.from(Buffer.from(value, bufferEncoding));
    },
  };
  return {
    schema,
    encoding,
  };
}

export const Utf8EncodedString = z.string();
export type Utf8EncodedString = string;

const base64 = createBufferSchema("base64");
export const Base64EncodedString = base64.schema;
export type Base64EncodedString = z.infer<typeof Base64EncodedString>;

const hex = createBufferSchema("hex");
export const HexEncodedString = hex.schema;
export type HexEncodedString = z.infer<typeof HexEncodedString>;

export const HexEncodedStringWithPrefix = z
  .string()
  .refine((str): str is `0x${HexEncodedString}` => {
    return (
      str.startsWith("0x") &&
      HexEncodedString.safeParse(str.substring(2)).success
    );
  });
export type HexEncodedStringWithPrefix = z.infer<
  typeof HexEncodedStringWithPrefix
>;

const hexEncodedStringWithPrefixEncoding: AbstractEncoding<HexEncodedStringWithPrefix> =
  {
    fromBytes(bytes: Uint8Array) {
      return HexEncodedStringWithPrefix.parse(
        `0x${Buffer.from(bytes).toString("hex")}`,
      );
    },
    toBytes(hex: HexEncodedStringWithPrefix) {
      return Uint8Array.from(Buffer.from(hex.substring(2), "hex"));
    },
  };

export class Encoding {
  protected constructor(protected bytes: Uint8Array) {}

  public toBytes() {
    return this.bytes;
  }

  public toUtf8() {
    return Buffer.from(this.bytes).toString("utf8");
  }

  public toBase64() {
    return base64.encoding.fromBytes(this.bytes);
  }

  public toHex() {
    return hex.encoding.fromBytes(this.bytes);
  }

  public toPrefixedHex() {
    return hexEncodedStringWithPrefixEncoding.fromBytes(this.bytes);
  }

  public static fromBytes(bytes: Uint8Array) {
    return new Encoding(bytes);
  }

  public static fromUtf8(str: Utf8EncodedString) {
    return new Encoding(Uint8Array.from(Buffer.from(str, "utf8")));
  }

  public static fromBase64(str: Base64EncodedString) {
    return new Encoding(base64.encoding.toBytes(str));
  }

  public static fromHex(str: HexEncodedString) {
    return new Encoding(hex.encoding.toBytes(str));
  }

  public static fromPrefixedHex(str: HexEncodedStringWithPrefix) {
    return new Encoding(hexEncodedStringWithPrefixEncoding.toBytes(str));
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
