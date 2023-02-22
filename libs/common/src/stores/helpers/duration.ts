import { z } from "zod";

export const DurationInDays = z.object({
  days: z.number().int(),
});

export const DurationInMonths = z.object({
  months: z.number().int(),
});

export const DurationInYears = z.object({
  years: z.number().int(),
});

export const Duration = z.union([
  DurationInDays,
  DurationInMonths,
  DurationInYears,
]);
