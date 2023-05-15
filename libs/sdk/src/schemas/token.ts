import BigNumber from "bignumber.js";
import { z } from "zod";

import { ChainId } from "../chains";
import type { Token } from "../sdk";
import { Sdk } from "../sdk";

/**
 * Zod schema that validates a token amount with potential decimal separator (e.g. "123.456")
 * and returns a {@link Token}.
 */
export function token(chainId: ChainId) {
  return z
    .object({
      id: z.string(),
      amount: z.string(),
    })
    .transform(({ id, amount }) => {
      const { digits } = Sdk.chainId(chainId).bank.enrichToken({
        id,
        rawAmount: "0",
      });
      return {
        id,
        amount: amount.trim().replace(",", "."),
        digits,
      };
    })
    .refine(({ amount }) => {
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
    .refine(({ amount, digits }) => {
      const fractionalPart = amount.split(".")[1] ?? [];
      return fractionalPart.length <= digits;
    }, "Precision overflow")
    .transform(({ id, amount, digits }) => {
      return {
        id,
        amount: new BigNumber(amount).multipliedBy(10 ** digits),
      };
    })
    .refine(({ amount }) => {
      if (!(amount instanceof BigNumber)) return true;
      return amount.gt(0);
    }, "Amount must be greater than 0")
    .transform(({ id, amount }): Token => {
      return {
        id,
        rawAmount: amount.toString(),
      };
    });
}

/**
 * Zod schema similar to {@link token} but also validates that the balance is sufficient.
 */
export function tokenGivenBalances({
  chainId,
  balances,
}: {
  chainId: ChainId;
  balances?: Token[];
}) {
  return token(chainId)
    .refine((token) => {
      return token.id !== "";
    }, "No token selected")
    .refine((token) => {
      if (token.id === "") return true;
      const balance = balances?.find((balance) => balance.id === token.id) ?? {
        id: token.id,
        rawAmount: "0",
      };
      return new BigNumber(balance.rawAmount).isGreaterThanOrEqualTo(
        token.rawAmount
      );
    }, "Insufficient balance");
}
