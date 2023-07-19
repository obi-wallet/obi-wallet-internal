import { ChainId, Sdk } from "@obi-wallet/sdk";
import z from "zod";

export function trim<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((val) => String(val).trim(), schema);
}

export function nonEmptyString(key: string) {
  return trim(z.string().nonempty(`${key} cannot be empty`));
}

export function mnemonic() {
  return nonEmptyString("Mnemonic").refine((val) => {
    const words = val.split(" ");
    return words.length > 12;
  }, "Invalid mnemonic");
}

export function address(chainId: ChainId) {
  return nonEmptyString("Address").refine(
    (address: string) => {
      return Sdk.chainId(chainId).transactions.validateAddress(address);
    },
    {
      message: "Invalid address",
    },
  );
}
