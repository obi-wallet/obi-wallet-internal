import BigNumber from "bignumber.js";
import z from "zod";

import { ChainId } from "../chains";
import { Sdk } from "../sdk";
import type { Token } from "../sdk";

/**
 * Zod schema that validates a token amount (e.g. "123.456") and returns a {@link Token}.
 */
export function token({
  chainId,
  id,
}: { chainId: ChainId } & Pick<Token, "id">) {
  const { digits } = Sdk.chainId(chainId).bank.enrichToken({ id, amount: "0" });

  return z
    .string()
    .transform((val) => val.trim().replace(",", "."))
    .refine((amount) => {
      const containsOnlyDigitsAndDecimalSeparators = /^[0-9.,]*$/.test(amount);
      const containsAtLeastOneDigit = /[0-9]/.test(amount);
      const containsAtMostOneDecimalSeparator =
        (amount.match(/([.])/g) ?? []).length <= 1;
      return (
        containsOnlyDigitsAndDecimalSeparators &&
        containsAtLeastOneDigit &&
        containsAtMostOneDecimalSeparator
      );
    })
    .refine((amount) => {
      const fractionalPart = amount.split(".")[1] ?? [];
      return fractionalPart.length <= digits;
    }, "Precision overflow")
    .transform((amount): Token => {
      return {
        id,
        amount: new BigNumber(amount).multipliedBy(10 ** digits).toString(),
      };
    });
}
