import { TerraClient } from "./client";
import { TerraChain } from "../../chains";
import { AbstractBankSdk } from "../abstract";
import { Coin } from "../common";

export class TerraBankSdk extends AbstractBankSdk {
  protected client: TerraClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: TerraChain;
    client: TerraClient;
  }) {
    super(chainId);
    this.client = client;
  }

  protected async balancesQueryFn(address: string): Promise<Coin[]> {
    return await this.client.withClient(async (client) => {
      return await this.client.fetchAllPages(async (paginationOptions) => {
        const [coins, pagination] = await client.bank.balance(
          address,
          paginationOptions
        );
        return [
          coins.map((coin): Coin => {
            return {
              denom: coin.denom,
              amount: coin.amount.toString(),
            };
          }),
          pagination,
        ];
      });
    });
  }
}
