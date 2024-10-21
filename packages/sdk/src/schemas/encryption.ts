import { Base64EncodedString } from "@obi-wallet/encoding";
import { deserialize } from "@obi-wallet/sdk-json";
import { z } from "zod";

export const AesGcmEncryptedData = Base64EncodedString.brand(
  "AesGcmEncryptedData",
);
export type AesGcmEncryptedData = z.infer<typeof AesGcmEncryptedData>;

export const Secp256k1EncryptedData = Base64EncodedString.brand(
  "Secp256k1EncryptedData",
);
export type Secp256k1EncryptedData = z.infer<typeof Secp256k1EncryptedData>;

const ParsedMultisigKeyEncryptedData = z.string().transform((value, ctx) => {
  const schema = z.tuple([AesGcmEncryptedData]).rest(Secp256k1EncryptedData);
  try {
    const result = schema.safeParse(deserialize(value));
    if (result.success) {
      return result.data;
    }
  } catch (e) {
    console.error(e);
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Not a MultisigKeyParsedEncryptedData`,
    });
  }
  return z.NEVER;
});

export const MultisigKeyEncryptedData = z
  .string()
  .refine((value) => {
    return ParsedMultisigKeyEncryptedData.safeParse(value).success;
  })
  .brand("MultisigKeyEncryptedData");
export type MultisigKeyEncryptedData = z.infer<typeof MultisigKeyEncryptedData>;

export function parseMultisigKeyEncryptedData(data: MultisigKeyEncryptedData) {
  return ParsedMultisigKeyEncryptedData.parse(data);
}

const ParsedPrimaryKeyEncryptedData = z.string().transform((value, ctx) => {
  const schema = z.tuple([Secp256k1EncryptedData, MultisigKeyEncryptedData]);
  try {
    const result = schema.safeParse(deserialize(value));
    if (result.success) {
      return result.data;
    }
  } catch (e) {
    console.error(e);
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Not a PrimaryKeyParsedEncryptedData`,
    });
  }
  return z.NEVER;
});

export const PrimaryKeyEncryptedData = z
  .string()
  .refine((value) => {
    return ParsedPrimaryKeyEncryptedData.safeParse(value).success;
  })
  .brand("PrimaryKeyEncryptedData");
export type PrimaryKeyEncryptedData = z.infer<typeof PrimaryKeyEncryptedData>;

export function parsePrimaryKeyEncryptedData(data: PrimaryKeyEncryptedData) {
  return ParsedPrimaryKeyEncryptedData.parse(data);
}
