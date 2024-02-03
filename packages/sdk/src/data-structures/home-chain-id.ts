import { z } from "zod";

import { HomeChainId } from "../home-chains";
import { SecretJsHomeChainId } from "../home-chains/secret-js";

export const HomeChainIdSchema: z.ZodType<HomeChainId> = z.union([
  z.literal(SecretJsHomeChainId.PULSAR_TESTNET),
  z.literal(SecretJsHomeChainId.MAINNET),
]);
