import { ChainId, KeyType } from "@obi-wallet/sdk";
import { CustomTheme } from "@obi-wallet/theme";

import { Feature } from "./feature";
import { ComingSoonKeyType } from "./key";
import { Language } from "./language";

export interface Config {
  chains: {
    enabled: ChainId[];
    default: ChainId;
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
  theme?: CustomTheme;
  ethereumBalances?: boolean;
}
