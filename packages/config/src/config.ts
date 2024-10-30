import { HomeChainId, KeyType } from "@obi-wallet/sdk";

import { Feature } from "./feature";
import { ComingSoonKeyType } from "./key";
import { Language } from "./language";

export interface Config {
  chains: {
    enabled: HomeChainId[];
    default: HomeChainId;
  };
  languages: {
    enabled: Language[];
    default: Language;
  };
  features: Record<Feature, boolean>;
  keys: {
    enabled: KeyType[];
    required: KeyType[];
    comingSoon: ComingSoonKeyType[];
  };
  ethereumBalances?: boolean;
  headless?: boolean;
}
