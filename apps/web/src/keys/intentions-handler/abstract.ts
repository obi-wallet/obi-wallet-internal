import { SingleKeyMetaData } from "@/stores/key-meta-data";
import { Base64EncodedString } from "@obi-wallet/encoding";
import { Key, MultisigKey } from "@obi-wallet/sdk";
import { fromPairs, splitAt } from "ramda";

interface MultisigKeyEncryptedMessage {
  encryptedMessage: Base64EncodedString;
  encryptedShares: Base64EncodedString[];
}

interface NewMultisigKeyEncryptedMessage {
  encryptedMessage: Base64EncodedString;
  encryptedShares: Record<string, Base64EncodedString>;
}

export interface IntentionsPayload {
  signHashes: Uint8Array[];
  decryptMessages: Base64EncodedString[];
  decryptMultisigKeyEncryptedMessages: string[];
}

export interface IntentionsResult {
  signedHashes: Uint8Array[];
  decryptedMessages: string[];
  decryptedShares: Base64EncodedString[];
}

export abstract class IntentionsHandler {
  protected key: Key;
  protected keyMetaData: SingleKeyMetaData;
  protected index: number;
  protected payload: IntentionsPayload;

  protected constructor({
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
      decryptedShares: decryptedShares.map((share) => {
        return Base64EncodedString.parse(share);
      }),
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
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const [encryptedMessage, ...encryptedShares] = JSON.parse(message) as [
      Base64EncodedString,
      ...Base64EncodedString[],
    ];

    return {
      encryptedMessage,
      encryptedShares,
    };
  }
}

export abstract class NewIntentionsHandler {
  protected owner: MultisigKey;
  protected payload: IntentionsPayload;

  public constructor({
    owner,
    payload,
  }: {
    owner: MultisigKey;
    payload: IntentionsPayload;
  }) {
    this.owner = owner;
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
      decryptedShares: decryptedShares.map((share) => {
        return Base64EncodedString.parse(share);
      }),
    };
  }

  protected getMessagesToDecrypt(publicKey: string) {
    return [
      ...this.payload.decryptMessages,
      ...this.payload.decryptMultisigKeyEncryptedMessages.map((m) => {
        return this.stringToMultisigKeyEncryptedMessage(m).encryptedShares[
          publicKey
        ]!;
      }),
    ];
  }

  protected stringToMultisigKeyEncryptedMessage(
    message: string,
  ): NewMultisigKeyEncryptedMessage {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const [encryptedMessage, ...encryptedShares] = JSON.parse(message) as [
      Base64EncodedString,
      ...Base64EncodedString[],
    ];

    return {
      encryptedMessage,
      encryptedShares: fromPairs(
        encryptedShares.map((share, index) => {
          return [this.owner.keys[index]!.publicKey.value, share];
        }),
      ),
    };
  }
}
