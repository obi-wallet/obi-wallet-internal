import { Key, SingleKeyMetaData } from "@obi-wallet/sdk";
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
  protected keyMetaData: SingleKeyMetaData;
  protected index: number;
  protected payload: IntentionsPayload;

  public constructor({
    key,
    keyMetaData,
    index,
    payload,
  }: {
    key: Key;
    keyMetaData: SingleKeyMetaData;
    index: number;
    payload: IntentionsPayload;
  }) {
    this.key = key;
    this.keyMetaData = keyMetaData;
    this.index = index;
    this.payload = payload;
  }

  protected toIntentionsResult(result: {
    signedHashes: Uint8Array[];
    decryptedMessages: string[];
  }): IntentionsResult {
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
