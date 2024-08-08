import { Caip19AssetId } from "@obi-wallet/sdk-caip";

export interface AssetInfo {
  name: string;
  symbol: string;
  decimals: number;
  image: string | null;
}

export abstract class AbstractAssetProvider {
  public abstract assetInfo(id: Caip19AssetId): Promise<AssetInfo | null>;
}
