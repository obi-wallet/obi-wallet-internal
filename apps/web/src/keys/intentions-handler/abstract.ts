import { Key } from "@obi-wallet/sdk";
import { splitAt } from "ramda";

export interface MultisigKeyEncryptedMessage {
  encryptedMessage: string;
  encryptedShares: string[];
}

export interface IntentionsPayload {
  signHashes: Uint8Array[];
  decryptMessages: string[];
  decryptMultisigKeyEncryptedMessages: MultisigKeyEncryptedMessage[];
}

export interface IntentionsResult {
  signedHashes: Uint8Array[];
  decryptedMessages: string[];
  decryptedShares: string[];
}

export abstract class IntentionsHandler {
  protected key: Key;
  protected index: number;
  protected payload: IntentionsPayload;

  public constructor({
    key,
    index,
    payload,
  }: {
    key: Key;
    index: number;
    payload: IntentionsPayload;
  }) {
    this.key = key;
    this.index = index;
    this.payload = payload;
  }

  public async newHandle(): Promise<IntentionsResult> {
    const result = await this.handle({
      signHashes: this.payload.signHashes,
      decryptMessages: this.messagesToDecrypt,
    });
    const [decryptedMessages, decryptedShares] = splitAt(
      this.payload.decryptMessages.length,
      result.decryptedMessages,
    );
    return {
      signedHashes: result.signedHashes,
      decryptedMessages,
      decryptedShares,
    };
  }

  public abstract handle(payload: {
    signHashes: Uint8Array[];
    decryptMessages: string[];
  }): Promise<{
    signedHashes: Uint8Array[];
    decryptedMessages: string[];
  }>;

  protected get messagesToDecrypt() {
    return [
      ...this.payload.decryptMessages,
      ...this.payload.decryptMultisigKeyEncryptedMessages.map((m) => {
        return m.encryptedShares[this.index]!;
      }),
    ];
  }
}
