import { z } from "zod";
const statusChainSchema = z.object({
  transactionId: z.string(),
  transactionUrl: z.string(),
  chainData: z
    .object({
      chainId: z.union([z.string(), z.number()]),
      chainName: z.string(),
      chainType: z.string(),
    })
    .optional(),
});

const routeStatusSchema = z
  .object({
    action: z.string(),
    status: z.string(),
    chainId: z.union([z.string(), z.number()]),
    txHash: z.string(),
  })
  .strict();
export const squidStatusSchema = z.object({
  status: z.string(),
  id: z.string(),
  fromChain: statusChainSchema,
  toChain: statusChainSchema,
  axelarTransactionUrl: z.string(),
  error: z.union([z.unknown(), z.null()]),
  gasStatus: z.string(),
  isGMPTransaction: z.boolean(),
  routeStatus: z.array(routeStatusSchema),
  squidTransactionStatus: z.string(),
  timeSpent: z.object({
    call_confirm: z.number(),
    total: z.number(),
  }),
});
export const onlyStatusSchema = z.object({
  status: z.string(),
});
export const emptySchema = z.object({}).strict();
export const squidStatusSchemaUnion = z.union([squidStatusSchema, emptySchema]);
export const skipStatusSchema = z.object({
  status: z.string().optional(),
  state: z.string().optional(),
  error: z.union([z.string(), z.null()]).optional(),
});

export const ethDepositStepStatusSchema = z.object({
  action: z.literal("EthDeposit"),
  chainId: z.string(),
  status: onlyStatusSchema,
  substeps: z.null(),
  txHash: z.union([z.string(), z.null()]),
});
export const squidStepStatusSchema = z.object({
  action: z.literal("Squid"),
  chainId: z.string(),
  status: z.union([squidStatusSchema, onlyStatusSchema]),
  substeps: z.null(),
  txHash: z.union([z.string(), z.null()]),
});
export const skipStepStatusSchema = z.object({
  action: z.literal("Skip"),
  chainId: z.string(),
  status: z.union([skipStatusSchema, onlyStatusSchema]),
  substeps: z.null(),
  txHash: z.union([z.string(), z.null()]),
});

export const stepStatusSchema = z.discriminatedUnion("action", [
  squidStepStatusSchema,
  skipStepStatusSchema,
  ethDepositStepStatusSchema,
]);
export const TransactionSchema = z.object({
  deposit_address: z.string(),
  fast_travel_time: z.number(),
  pubkey: z.string(),
  intent: z.object({
    destination_address: z.string(),
    destination_asset: z.string(),
    destination_chain_id: z.string(),
    max_slippage: z.string(),
  }),
  status: z.union([
    z.literal("AwaitingDeposit"),
    z.literal("Done"),
    z.literal("Failed"),
    z.literal("LowBalance"),
    z
      .string()
      .regex(
        /^InProgress\(\d+\)$/,
        "Status must be in the format 'InProgress[number]'",
      ),
  ]),
});
export const squidEstimateTokenSchema = z.object({
  address: z.string(),
  chainId: z.union([z.number(), z.string()]),
  coingeckoId: z.string(),
  commonKey: z.string().optional(),
  decimals: z.number(),
  logoURI: z.string(),
  name: z.string(),
  symbol: z.string(),
});
export const squidRouteFromChainSchema = z.object({
  toToken: squidEstimateTokenSchema,
  fromToken: squidEstimateTokenSchema,
  fromAmount: z.string(),
  toAmount: z.string(),
  toAmountMin: z.string(),
  type: z.string(),
});
export const squidRouteFromChainArraySchema = z.array(
  squidRouteFromChainSchema,
);
export const squidRouteTochainTransferSchema = z.object({
  fromChain: z.string(),
  toChain: z.string(),
  fromToken: squidEstimateTokenSchema,
  toToken: squidEstimateTokenSchema,
  type: z.literal("Transfer"),
});
export const squidRouteTochainSwapSchema = z.object({
  chainId: z.string(),
  dex: z.string(),
  fromAmount: z.string(),
  toAmount: z.string(),
  toAmountMin: z.string(),
  fromToken: squidEstimateTokenSchema,
  toToken: squidEstimateTokenSchema,
  type: z.literal("Swap"),
});

export const squidRouteToChainSchema = z.discriminatedUnion("type", [
  squidRouteTochainTransferSchema,
  squidRouteTochainSwapSchema,
]);

export const squidRouteToChainArraySchema = z.array(squidRouteToChainSchema);
export const squidRouteSchema = z.object({
  fromChain: squidRouteFromChainArraySchema,
  toChain: squidRouteToChainArraySchema,
});
export const squidEstimateSchema = z.object({
  aggregatePriceImpact: z.string(),
  estimatedRouteDuration: z.number(),
  exchangeRate: z.string(),
  feeCosts: z.array(
    z.object({
      amount: z.string(),
      amountUSD: z.string(),
      description: z.string(),
      name: z.string(),
      percentage: z.string(),
      token: squidEstimateTokenSchema,
    }),
  ),
  fromAmount: z.string(),
  fromAmountUSD: z.string(),
  gasCosts: z.array(
    z.object({
      amount: z.string(),
      amountUSD: z.string(),
      limit: z.string(),
      gasPrice: z.string(),
      maxFeePerGas: z.string(),
      maxPriorityFeePerGas: z.string(),
      token: squidEstimateTokenSchema,
      type: z.string(),
    }),
  ),

  isExpressSupported: z.boolean(),
  route: squidRouteSchema,
  sendAmount: z.string(),
  toAmount: z.string(),
  toAmountMin: z.string(),
  toAmountUSD: z.string(),
  toAmountMinUSD: z.string(),
});
export const squidParamsSchema = z.object({
  fromToken: squidEstimateTokenSchema,
  enableExpress: z.boolean(),
  enableForecall: z.string(),
  fromAddress: z.string(),
  fromChain: z.string(),
  integratorId: z.string(),
  toChain: z.string(),
  toToken: squidEstimateTokenSchema,
});
export const squidTransactionRequestSchema = z.object({
  data: z.string(),
  gasLimit: z.string(),
  maxFeePerGas: z.string(),
  maxPriorityFeePerGas: z.string(),
  routeType: z.string(),
  targetAddress: z.string(),
  value: z.string(),
});

export const squidStepSimulationSchema = z.object({
  estimate: squidEstimateSchema,
  params: squidParamsSchema,
  transactionRequest: squidTransactionRequestSchema,
});
export const skipSimulationSchema = z.union([
  z.object({
    multi_chain_msg: z.object({
      chain_id: z.string(),
      msg: z.string(),
      msg_type_url: z.string(),
      path: z.array(z.string()),
    }),
  }),
  z.null(),
]);
export const onlySquidStepSimulationSchema = z.tuple([
  z.null(),
  squidStepSimulationSchema,
]);
export const fullStepSimulationSchema = z.tuple([
  z.null(),
  squidStepSimulationSchema,
  skipSimulationSchema,
]);

export const nullStepSimulationSchema = z.union([
  z.tuple([z.null(), z.null()]),
  z.tuple([z.null(), z.null(), z.null()]),
]);
export const stepSimulationsSchema = z.union([
  nullStepSimulationSchema,
  onlySquidStepSimulationSchema,
  fullStepSimulationSchema,
]);

export const simulationEntrySchemaObject = z.object({
  //   skip_simulation_body: z.union([skipSimulationBodySchema, z.null()]),
  step_simulations: stepSimulationsSchema,

  step_statuses: z.array(stepStatusSchema),
  transaction: TransactionSchema,
});

export const simulationEntrySchema = z.array(simulationEntrySchemaObject);
