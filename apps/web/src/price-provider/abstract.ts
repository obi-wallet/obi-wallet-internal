import { Caip19AssetId } from "@obi-wallet/sdk-caip";

export interface PriceInfo {
  usdValue: string;
}

export abstract class AbstractPriceProvider {
  public abstract priceInfo(id: Caip19AssetId): Promise<PriceInfo | null>;
}
