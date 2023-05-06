import { tokenPairs } from "./token-pairs";
import { tokens } from "./tokens";
import { TerraChainId } from "../../../chains";
import { FeatherJsClient } from "../../../clients";
import { FeatherJsBankSdk } from "../feather-js";

export class TerraBankSdk extends FeatherJsBankSdk {
  public constructor({
    chainId,
    client,
  }: {
    chainId: TerraChainId;
    client: FeatherJsClient;
  }) {
    super({
      chainId,
      client,
      tokens,
      tokenPairs,
      usdTokens: [
        // axlUSDC
        "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4",
        // axlUSDT
        "ibc/CBF67A2BCF6CAE343FDF251E510C8E18C361FC02B23430C121116E0811835DEF",
      ],
    });
    this.client = client;
  }
}
