import warning from "tiny-warning";

import { MultisigKey } from "../../../data-structures";
import { AbstractUserInteractionResponse } from "../../../user-interactions/abstract";
import { BroadcastTransactionResult } from "../../common";
import { AbstractWalletsSdk } from "../abstract";

function notImplemented(message: string) {
  warning(false, message);
}

export class LegacyCosmosWalletsSdk extends AbstractWalletsSdk {
  public async createWallet(_: {
    multisigKey: MultisigKey;
    demoMode: boolean;
  }): Promise<
    AbstractUserInteractionResponse<
      { proxyAddress: string },
      {
        description: string;
        originalPayload: BroadcastTransactionResult;
      }
    >
  > {
    notImplemented("createWallet not implemented for Cosmos");
    return {
      approved: false as const,
    };
  }
}
