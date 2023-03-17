import wordlist from "bip39/src/wordlists/english.json";
import z from "zod";
export const trim = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => String(val).trim(), schema);

export const validateNonEmptyString = (key: string) =>
  trim(z.string().nonempty(`${key} cannot be empty`));

export const validateMnemonic = () =>
  validateNonEmptyString("Mnemonic").refine((val) => {
    const words = val.split(" ");
    if (words.length !== 12 && words.length !== 24) {
      return false;
    }
    return words.every((word) => wordlist.includes(word));
  }, `invalid mnemonic`);
