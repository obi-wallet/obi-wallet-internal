import z from "zod";

export const trim = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => String(val).trim(), schema);

export const nonEmptyString = (key: string) =>
  trim(z.string().nonempty(`${key} cannot be empty`));

export const mnemonic = () =>
  nonEmptyString("Mnemonic").refine((val) => {
    const words = val.split(" ");
    return words.length > 12;
  }, `Invalid mnemonic`);
