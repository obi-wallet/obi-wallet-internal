import { queryClient, QueryClientNamespace } from "@obi-wallet/query-client";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import {
  SessionRequestPayload,
  SessionRequestResponse,
} from "@obi-wallet/wallet-connect";
import { Query } from "@tanstack/query-core";

export interface AssetInfo {
  name: string;
  symbol: string;
  decimals: number;
  image: string | null;
}

export type AssetId = string;

export interface Asset<T extends string = string> {
  chainId: T;
  assetId: AssetId;
  rawAmount: string;
}

export interface PriceInfo {
  usdValue: string;
}

export abstract class AbstractTargetChain<
  TChainId extends string = string,
  TAddress extends string = string,
> {
  protected queryNamespace: QueryClientNamespace<
    "target-chain",
    { chainId: TChainId }
  >;

  protected constructor(protected chainId: TChainId) {
    this.queryNamespace = new QueryClientNamespace("target-chain", {
      chainId,
    });
  }

  public abstract get label(): string;
  public abstract get image(): string;
  public abstract get disabled(): boolean;

  public abstract computeAddress(publicKey: Secp256k1PublicKey): string;

  public obiAccountAddress(publicKey: Secp256k1PublicKey) {
    return queryClient.fetchQuery(this.obiAccountAddressQuery(publicKey));
  }
  public get obiAccountAddressQuery() {
    return this.queryNamespace.createQuery({
      name: "obiAccountAddress",
      fn: this.obiAccountAddressQueryFn.bind(this),
      staleTime: { day: 1 },
    });
  }
  protected abstract obiAccountAddressQueryFn(
    publicKey: Secp256k1PublicKey,
  ): Promise<TAddress>;

  public abstract validateAddress(address: string): boolean;

  public balances(address: string) {
    return queryClient.fetchQuery(this.balancesQuery(address));
  }
  public get balancesQuery() {
    return this.queryNamespace.createQuery({
      name: "balances",
      fn: this.balancesQueryFn.bind(this),
      staleTime: (query: Query<Asset<TChainId>[]>) => {
        if (!query.state.data || query.state.data.length > 0) {
          return { seconds: 5 };
        }

        return { minutes: 5 };
      },
    });
  }
  public abstract balancesQueryFn(address: string): Promise<Asset<TChainId>[]>;

  public price(id: AssetId) {
    return queryClient.fetchQuery(this.priceQuery(id));
  }
  public get priceQuery() {
    return this.queryNamespace.createQuery({
      name: "prices",
      fn: this.priceQueryFn.bind(this),
      staleTime: { minute: 1 },
    });
  }
  public abstract priceQueryFn(id: AssetId): Promise<PriceInfo>;

  public abstract assetInfo(id: AssetId): AssetInfo | null;

  public abstract handleWalletConnectSessionRequest(
    payload: SessionRequestPayload,
  ): Promise<SessionRequestResponse>;
}
