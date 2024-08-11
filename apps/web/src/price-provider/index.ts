import { SkipPriceProvider } from "@/skip";
import { SquidPriceProvider } from "@/squid";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";

import { AbstractPriceProvider } from "./abstract";

export class PriceProvider implements AbstractPriceProvider {
  protected static instance: PriceProvider | null = null;
  protected sources: AbstractPriceProvider[];

  protected constructor() {
    this.sources = [new SkipPriceProvider(), new SquidPriceProvider()];
  }

  public static getInstance(): PriceProvider {
    if (!PriceProvider.instance) {
      PriceProvider.instance = new PriceProvider();
    }

    return PriceProvider.instance;
  }

  public async priceInfo(id: Caip19AssetId) {
    for (const source of this.sources) {
      const price = await source.priceInfo(id);
      if (price) return price;
    }

    return null;
  }
}
