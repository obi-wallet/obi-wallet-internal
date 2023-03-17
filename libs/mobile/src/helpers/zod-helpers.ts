import z from "zod";

export const trim = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => String(val).trim(), schema);

export const validateNonEmptyString = (key: string) =>
  trim(z.string().nonempty(`${key} cannot be empty`));
