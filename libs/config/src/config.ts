import { ChainId, KeyType } from "@obi-wallet/sdk";

import { Brand } from "./brand";
import { Feature } from "./feature";
import { Language } from "./language";

export interface Config {
  brand: Brand;
  chains: {
    enabled: ChainId[];
    default: ChainId;
  };
  languages: {
    enabled: Language[];
    default: Language;
  };
  features: Record<Feature, boolean>;
  requiredKeys: KeyType[];
}
