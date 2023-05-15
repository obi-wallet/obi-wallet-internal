import { Chain, CosmosChainId, LegacyCosmosChainId } from "../../../chains";
import { CosmJsClient } from "../../../clients";
import { EnrichedToken, Token } from "../../common";
import { AbstractBankSdk } from "../abstract";

export class CosmJsBankSdk extends AbstractBankSdk {
  protected override chainId: CosmosChainId | LegacyCosmosChainId;
  protected client: CosmJsClient;

  public constructor({
    chainId,
    client,
  }: {
    chainId: CosmosChainId | LegacyCosmosChainId;
    client: CosmJsClient;
  }) {
    super(chainId);
    this.chainId = chainId;
    this.client = client;
  }

  protected async balancesQueryFn(address: string): Promise<Token[]> {
    return await this.client.withClients(async ({ stargateClient }) => {
      return await fetchNativeBalances();

      async function fetchNativeBalances() {
        const coins = await stargateClient.getAllBalances(address);
        return coins.map((coin) => {
          return {
            id: coin.denom,
            rawAmount: coin.amount,
          };
        });
      }
    });
  }

  protected async pricesQueryFn(): Promise<Record<string, number>> {
    return {};
  }

  protected override enrichTokenWithoutUsdValue(token: Token): EnrichedToken {
    switch (token.id) {
      case this.chain.denom: {
        const digits = 6;
        return {
          ...token,
          amount: parseInt(token.rawAmount, 10) / 10 ** digits,
          contract: null,
          icon: null,
          denom: this.chain.denom.slice(1).toUpperCase(),
          digits,
          label: this.chain.denom[1].toUpperCase() + this.chain.denom.slice(2),
          usdValue: null,
        };
      }
      default:
        return super.enrichToken(token);
    }
  }

  protected get chain() {
    return Chain.information(this.chainId);
  }
}
