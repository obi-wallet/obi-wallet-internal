import { z } from "zod";

const StatusChain = z.object({
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

const RouteStatus = z
  .object({
    action: z.string(),
    status: z.string(),
    chainId: z.union([z.string(), z.number()]),
    txHash: z.string(),
  })
  .strict();

export const SquidStatus = z.object({
  status: z.string(),
  id: z.string(),
  fromChain: StatusChain,
  toChain: StatusChain,
  axelarTransactionUrl: z.string(),
  error: z.union([z.unknown(), z.null()]),
  gasStatus: z.string(),
  isGMPTransaction: z.boolean(),
  routeStatus: z.array(RouteStatus),
  squidTransactionStatus: z.string(),
  timeSpent: z.object({
    call_confirm: z.number(),
    total: z.number(),
  }),
});

export const OnlyStatus = z.object({
  status: z.string(),
});

export const EmptyObject = z.object({}).strict();

export const SkipStatus = z.object({
  status: z.string().optional(),
  state: z.string().optional(),
  error: z.union([z.string(), z.null()]).optional(),
});

export const EthDepositStepStatus = z.object({
  action: z.literal("EthDeposit"),
  chainId: z.string(),
  status: OnlyStatus,
  substeps: z.null(),
  txHash: z.union([z.string(), z.null()]),
});

export const SquidStepStatus = z.object({
  action: z.literal("Squid"),
  chainId: z.string(),
  status: z.union([SquidStatus, OnlyStatus]),
  substeps: z.null(),
  txHash: z.union([z.string(), z.null()]),
});

export const SkipStepStatus = z.object({
  action: z.literal("Skip"),
  chainId: z.string(),
  status: z.union([SkipStatus, OnlyStatus]),
  substeps: z.null(),
  txHash: z.union([z.string(), z.null()]),
});

export const StepStatus = z.discriminatedUnion("action", [
  SquidStepStatus,
  SkipStepStatus,
  EthDepositStepStatus,
]);

export type StepStatus = z.infer<typeof StepStatus>;

export const Transaction = z.object({
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

export type Transaction = z.infer<typeof Transaction>;

export const SquidEstimateToken = z.object({
  address: z.string(),
  chainId: z.union([z.number(), z.string()]),
  coingeckoId: z.string(),
  commonKey: z.string().optional(),
  decimals: z.number(),
  logoURI: z.string(),
  name: z.string(),
  symbol: z.string(),
});

export const SquidRouteFromChain = z.object({
  toToken: SquidEstimateToken,
  fromToken: SquidEstimateToken,
  fromAmount: z.string(),
  toAmount: z.string(),
  toAmountMin: z.string(),
  type: z.string(),
});

export type SquidRouteFromChain = z.infer<typeof SquidRouteFromChain>;

export const SquidRouteFromChainArray = z.array(SquidRouteFromChain);

export const SquidRouteToChainTransfer = z.object({
  fromChain: z.string(),
  toChain: z.string(),
  fromToken: SquidEstimateToken,
  toToken: SquidEstimateToken,
  type: z.literal("Transfer"),
});

export const SquidRouteToChainSwap = z.object({
  chainId: z.string(),
  dex: z.string(),
  fromAmount: z.string(),
  toAmount: z.string(),
  toAmountMin: z.string(),
  fromToken: SquidEstimateToken,
  toToken: SquidEstimateToken,
  type: z.literal("Swap"),
});

export const SquidRouteToChain = z.discriminatedUnion("type", [
  SquidRouteToChainTransfer,
  SquidRouteToChainSwap,
]);

export type SquidRouteToChain = z.infer<typeof SquidRouteToChain>;

export const SquidRouteToChainArray = z.array(SquidRouteToChain);

export const SquidRoute = z.object({
  fromChain: SquidRouteFromChainArray,
  toChain: SquidRouteToChainArray,
});

export const SquidEstimate = z.object({
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
      token: SquidEstimateToken,
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
      token: SquidEstimateToken,
      type: z.string(),
    }),
  ),

  isExpressSupported: z.boolean(),
  route: SquidRoute,
  sendAmount: z.string(),
  toAmount: z.string(),
  toAmountMin: z.string(),
  toAmountUSD: z.string(),
  toAmountMinUSD: z.string(),
});

export const SquidParams = z.object({
  fromToken: SquidEstimateToken,
  enableExpress: z.boolean(),
  enableForecall: z.string(),
  fromAddress: z.string(),
  fromChain: z.string(),
  integratorId: z.string(),
  toChain: z.string(),
  toToken: SquidEstimateToken,
});

export const SquidTransactionRequest = z.object({
  data: z.string(),
  gasLimit: z.string(),
  maxFeePerGas: z.string(),
  maxPriorityFeePerGas: z.string(),
  routeType: z.string(),
  targetAddress: z.string(),
  value: z.string(),
});

export const SquidStepSimulation = z.object({
  estimate: SquidEstimate,
  params: SquidParams,
  transactionRequest: SquidTransactionRequest,
});

export const SkipSimulation = z.union([
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

export const OnlySquidStepSimulation = z.tuple([z.null(), SquidStepSimulation]);

export const FullStepSimulation = z.tuple([
  z.null(),
  SquidStepSimulation,
  SkipSimulation,
]);

export const NullStepSimulation = z.union([
  z.tuple([z.null(), z.null()]),
  z.tuple([z.null(), z.null(), z.null()]),
]);

export const StepSimulations = z.union([
  NullStepSimulation,
  OnlySquidStepSimulation,
  FullStepSimulation,
]);

export type StepSimulations = z.infer<typeof StepSimulations>;

export const SimulationEntryObject = z.object({
  step_simulations: StepSimulations,
  step_statuses: z.array(StepStatus),
  transaction: Transaction,
});

export type SimulationEntryObject = z.infer<typeof SimulationEntryObject>;

export const SimulationEntry = z.array(SimulationEntryObject);
