import { TerraChain, terraChains } from "@obi-wallet/sdk";
import { CreateTxOptions } from "@terra-money/feather.js";
import axios from "axios";

export type TxGasOptions = Pick<CreateTxOptions, "gasPrices" | "gasAdjustment">;

const cache: Partial<Record<TerraChain, TxGasOptions>> = {};

export async function getTxGasOptions({
  chainId,
}: {
  chainId: TerraChain;
}): Promise<TxGasOptions> {
  const baseURL = terraChains[chainId].api;
  const path = "/v1/txs/gas_prices";

  const c = cache[chainId];
  if (c) return c;

  const { data } = await axios.get<TxGasOptions["gasPrices"]>(path, {
    baseURL,
  });
  const txGasOptions = {
    gasPrices: data,
    gasAdjustment: 2,
  };
  cache[chainId] = txGasOptions;
  return txGasOptions;
}
