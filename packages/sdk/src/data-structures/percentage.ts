import { z } from "zod";

export const Percentage = z.number().gte(0).lte(1);
