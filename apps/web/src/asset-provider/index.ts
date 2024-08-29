import { AssetRegistry } from "@/asset-registry";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";

import { AbstractAssetProvider } from "./abstract";

export class AssetProvider implements AbstractAssetProvider {
  protected static instance: AssetProvider | null = null;

  public static getInstance(): AssetProvider {
    if (!AssetProvider.instance) {
      AssetProvider.instance = new AssetProvider();
    }

    return AssetProvider.instance;
  }

  public async assetInfo(id: Caip19AssetId) {
    const response = await AssetRegistry.getInstance().byId(id);
    return response.assetInfo;
  }
}
