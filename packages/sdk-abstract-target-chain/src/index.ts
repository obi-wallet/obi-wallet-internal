import { queryClient, QueryClientNamespace } from "@obi-wallet/query-client";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";

export interface Asset {
  name: string;
  symbol: string;
  decimals: number;
  image: string | null;
}

export abstract class AbstractTargetChain {
  protected queryNamespace: QueryClientNamespace<
    "target-chain",
    { chainId: string }
  >;

  protected constructor(protected chainId: string) {
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
  ): Promise<string>;

  public abstract validateAddress(address: string): boolean;

  public abstract getAsset(denom: string): Asset | null;
}
