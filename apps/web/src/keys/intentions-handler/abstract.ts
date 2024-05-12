import { SingleKeyMetaData } from "@/stores/key-meta-data";
import { Base64 } from "@obi-wallet/encoding";
import { Key, MultisigKey } from "@obi-wallet/sdk";
import { fromPairs, splitAt } from "ramda";

interface MultisigKeyEncryptedMessage {
  encryptedMessage: Base64;
  encryptedShares: Base64[];
}

interface NewMultisigKeyEncryptedMessage {
  encryptedMessage: Base64;
  encryptedShares: Record<string, Base64>;
}

export interface IntentionsPayload {
  signHashes: Uint8Array[];
  decryptMessages: Base64[];
  decryptMultisigKeyEncryptedMessages: string[];
}

export interface IntentionsResult {
  signedHashes: Uint8Array[];
  decryptedMessages: string[];
  decryptedShares: Base64[];
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
        return Base64.parse(share);
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
      Base64,
      ...Base64[],
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
        return Base64.parse(share);
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
      Base64,
      ...Base64[],
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
