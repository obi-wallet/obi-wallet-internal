import { queryClient, QueryClientNamespace } from "@obi-wallet/query-client";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
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

export interface Caip19Asset {
  assetId: Caip19AssetId;
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

  public nativeBalances(address: string) {
    return queryClient.fetchQuery(this.nativeBalancesQuery(address));
  }
  public get nativeBalancesQuery() {
    return this.queryNamespace.createQuery({
      name: "nativeBalances",
      fn: this.nativeBalancesQueryFn.bind(this),
      staleTime: (query: Query<Caip19Asset[]>) => {
        if (!query.state.data || query.state.data.length > 0) {
          return { seconds: 5 };
        }

        return { minutes: 5 };
      },
    });
  }
  public abstract nativeBalancesQueryFn(
    address: string,
  ): Promise<Caip19Asset[]>;

  public tokenBalance({
    address,
    assetId,
  }: {
    address: string;
    assetId: Caip19AssetId;
  }) {
    return queryClient.fetchQuery(this.tokenBalanceQuery({ address, assetId }));
  }
  public get tokenBalanceQuery() {
    return this.queryNamespace.createQuery({
      name: "tokenBalance",
      fn: this.tokenBalanceQueryFn.bind(this),
      staleTime: (query: Query<string>) => {
        if (!query.state.data || query.state.data.length > 0) {
          return { seconds: 5 };
        }

        return { minutes: 5 };
      },
    });
  }
  public abstract tokenBalanceQueryFn({
    address,
    assetId,
  }: {
    address: string;
    assetId: Caip19AssetId;
  }): Promise<string>;

  public price(id: AssetId) {
    return queryClient.fetchQuery(this.priceQuery(id));
  }
  public get priceQuery() {
    return this.queryNamespace.createQuery({
      name: "price",
      fn: this.priceQueryFn.bind(this),
      staleTime: { minute: 1 },
    });
  }
  public abstract priceQueryFn(id: AssetId): Promise<PriceInfo>;

  public newPrice(id: Caip19AssetId) {
    return queryClient.fetchQuery(this.newPriceQuery(id));
  }
  public get newPriceQuery() {
    return this.queryNamespace.createQuery({
      name: "newPrice",
      fn: this.newPriceQueryFn.bind(this),
      staleTime: { minute: 1 },
    });
  }
  public abstract newPriceQueryFn(id: Caip19AssetId): Promise<PriceInfo>;

  public abstract assetInfo(id: AssetId): AssetInfo | null;
  public abstract newAssetInfo(id: Caip19AssetId): Promise<AssetInfo | null>;

  public abstract handleWalletConnectSessionRequest(
    payload: SessionRequestPayload,
  ): Promise<SessionRequestResponse>;
}
