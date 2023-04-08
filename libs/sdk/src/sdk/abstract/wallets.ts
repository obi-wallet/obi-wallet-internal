import { MultisigKey } from "../../data-structures";
import { AbstractUserInteractionResponse } from "../../user-interactions/abstract";
import { BroadcastTransactionResult } from "../common";

export abstract class AbstractWalletsSdk {
  public abstract createWallet({
    multisigKey,
    demoMode,
  }: {
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
  >;
}
