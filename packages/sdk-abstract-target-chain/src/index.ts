import { EncodeObject } from "@cosmjs/proto-signing";
import { StdFee } from "@cosmjs/stargate";
import { queryClient, QueryClientNamespace } from "@obi-wallet/query-client";
import { AssetRegistry } from "@obi-wallet/sdk-asset-registry";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import {
  SessionRequestPayload,
  SessionRequestResponse,
} from "@obi-wallet/wallet-connect";
import { Query } from "@tanstack/query-core";
import { Msg } from "secretjs";

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

  protected constructor(public chainId: TChainId) {
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
  public abstract validateMessages(
    messages: unknown[],
  ): messages is EncodeObject[] | Msg[];
  public abstract validateFee(fee: unknown): fee is StdFee;

  public abstract isNativeAsset(assetId: Caip19AssetId): boolean;
  public abstract isTokenAsset(assetId: Caip19AssetId): boolean;

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

  public async price(id: Caip19AssetId) {
    const priceInfo = await AssetRegistry.getInstance().byId(id);
    if (priceInfo?.priceInfo) return priceInfo.priceInfo;

    return { usdValue: "0" };
  }

  public abstract assetInfo(id: Caip19AssetId): Promise<AssetInfo | null>;

  public abstract handleWalletConnectSessionRequest(
    payload: SessionRequestPayload,
  ): Promise<SessionRequestResponse>;

  public abstract denomToCaip19AssetId(denom: string): Caip19AssetId | null;
  public abstract caip19AssetIdToDenom(assetId: Caip19AssetId): string | null;
}
