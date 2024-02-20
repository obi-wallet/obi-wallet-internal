import { TargetChain, TargetChainId } from "@/target-chain";
import z from "zod";

export function trim<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((val) => String(val).trim(), schema);
}

export function nonEmptyString(key: string) {
  return trim(z.string().min(1, `${key} cannot be empty`));
}

export function address(chainId: TargetChainId) {
  return nonEmptyString("Address").refine(
    (address: string) => {
      return TargetChain.chainId(chainId).validateAddress(address);
    },
    {
      message: "Invalid address",
    },
  );
}
