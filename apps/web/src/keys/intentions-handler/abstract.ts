import { Key } from "@obi-wallet/sdk";

export interface IntentionsPayload {
  signHashes: Uint8Array[];
  decryptMessages: string[];
}

export interface IntentionsResult {
  signedHashes: Uint8Array[];
  decryptedMessages: string[];
}

export abstract class IntentionsHandler {
  public constructor(protected key: Key) {}

  public abstract handle(payload: IntentionsPayload): Promise<IntentionsResult>;
}
