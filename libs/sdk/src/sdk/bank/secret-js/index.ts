import warning from "tiny-warning";

import { SecretJsChainId, secretJsChains } from "../../../chains";
import { EnrichedToken, Token } from "../../common";
import { AbstractBankSdk } from "../abstract";

function notImplemented(message: string) {
  warning(false, message);
}

export class SecretJsBankSdk extends AbstractBankSdk {
  protected override chainId: SecretJsChainId;

  public constructor({ chainId }: { chainId: SecretJsChainId }) {
    super(chainId);
    this.chainId = chainId;
  }

  protected async balancesQueryFn(_address: string): Promise<Token[]> {
    notImplemented("balancesQueryFn not implemented for SecretJS");
    return [];
  }

  protected async pricesQueryFn(): Promise<Record<string, number>> {
    return {};
  }

  protected override enrichTokenWithoutUsdValue(token: Token): EnrichedToken {
    switch (token.id) {
      default:
        return super.enrichToken(token);
    }
  }

  protected get chain() {
    return secretJsChains[this.chainId];
  }
}
