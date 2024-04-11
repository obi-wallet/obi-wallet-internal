import { Key } from "@obi-wallet/sdk";
import { splitAt } from "ramda";

interface MultisigKeyEncryptedMessage {
  encryptedMessage: string;
  encryptedShares: string[];
}

export interface IntentionsPayload {
  signHashes: Uint8Array[];
  decryptMessages: string[];
  decryptMultisigKeyEncryptedMessages: string[];
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

  public async handle(): Promise<IntentionsResult> {
    const result = await this.internalHandle({
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

  public abstract internalHandle(payload: {
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
        return this.stringToMultisigKeyEncryptedMessage(m).encryptedShares[
          this.index
        ]!;
      }),
    ];
  }

  protected stringToMultisigKeyEncryptedMessage(
    message: string,
  ): MultisigKeyEncryptedMessage {
    const [encryptedMessage, ...encryptedShares] = JSON.parse(message) as [
      string,
      ...string[],
    ];
    return {
      encryptedMessage,
      encryptedShares,
    };
  }
}
