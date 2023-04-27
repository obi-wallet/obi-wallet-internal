import BigNumber from "bignumber.js";
import z from "zod";

import { ChainId } from "../chains";
import type { Token } from "../sdk";
import { Sdk } from "../sdk";

/**
 * Zod schema that validates a token amount with potential decimal separator (e.g. "123.456")
 * and returns a {@link Token}.
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
    .transform((amount) => {
      return new BigNumber(amount).multipliedBy(10 ** digits);
    })
    .refine((amount: BigNumber | string) => {
      if (!(amount instanceof BigNumber)) return true;
      return amount.gt(0);
    }, "Amount must be greater than 0")
    .transform((amount): Token => {
      return {
        id,
        amount: amount.toString(),
      };
    });
}

/**
 * Zod schema similar to {@link token} but also validates that the balance is sufficient.
 */
export function tokenGivenBalance({
  chainId,
  balance,
}: {
  chainId: ChainId;
  balance: Token;
}) {
  return token({ chainId, id: balance.id }).refine(({ amount }) => {
    return new BigNumber(balance.amount).isGreaterThanOrEqualTo(amount);
  }, "Insufficient balance");
}
