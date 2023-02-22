import { z } from "zod";

export const ArrayIndex = z.number().int().nonnegative();
