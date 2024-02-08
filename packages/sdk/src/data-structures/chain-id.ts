import { z } from "zod";

import { ChainId } from "../chains";
import { SecretJsHomeChainId } from "../home-chains/secret-js";

export const ChainIdSchema: z.ZodType<ChainId> = z.union([
  z.literal(SecretJsHomeChainId.PULSAR_TESTNET),
  z.literal(SecretJsHomeChainId.MAINNET),
]);
