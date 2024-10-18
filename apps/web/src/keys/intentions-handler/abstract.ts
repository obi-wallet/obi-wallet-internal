import { SingleKeyMetaData } from "@/stores/key-meta-data";
import { Base64EncodedString } from "@obi-wallet/encoding";
import { Key, MultisigKey } from "@obi-wallet/sdk";
import { deserialize } from "@obi-wallet/sdk-json";
import { fromPairs, splitAt } from "ramda";

interface PrimaryKeyEncryptedMessage {
  primaryKeyEncryptedMessage: Base64EncodedString;
  multisigKeyEncryptedMessage: MultisigKeyEncryptedMessage;
}

interface NewPrimaryKeyEncryptedMessage {
  primaryKeyEncryptedMessage: Base64EncodedString;
  multisigKeyEncryptedMessage: NewMultisigKeyEncryptedMessage;
}

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
  decryptPrimaryKeyEncryptedMessages: string[];
  decryptMultisigKeyEncryptedMessages: string[];
}

export interface IntentionsResult {
  signedHashes: Uint8Array[];
  decryptedMessages: string[];
  decryptedPrimaryKeyEncryptedMessagesShares: Base64EncodedString[];
  decryptedMultisigKeyEncryptedMessagesShares: Base64EncodedString[];
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
    const [decryptedMessages, rest] = splitAt(
      this.payload.decryptMessages.length,
      result.decryptedMessages,
    );
    const [
      decryptedPrimaryKeyEncryptedMessagesShares,
      decryptedMultisigKeyEncryptedMessagesShares,
    ] = splitAt(this.payload.decryptPrimaryKeyEncryptedMessages.length, rest);
    return {
      signedHashes: result.signedHashes,
      decryptedMessages,
      decryptedPrimaryKeyEncryptedMessagesShares:
        decryptedPrimaryKeyEncryptedMessagesShares.map((message) => {
          return Base64EncodedString.parse(message);
        }),
      decryptedMultisigKeyEncryptedMessagesShares:
        decryptedMultisigKeyEncryptedMessagesShares.map((share) => {
          return Base64EncodedString.parse(share);
        }),
    };
  }

  protected get messagesToDecrypt() {
    return [
      ...this.payload.decryptMessages,
      ...this.payload.decryptPrimaryKeyEncryptedMessages.map((m) => {
        return this.stringToPrimaryKeyEncryptedMessage(m)
          .multisigKeyEncryptedMessage.encryptedShares[this.index]!;
      }),
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
    const [encryptedMessage, ...encryptedShares] = deserialize(message) as [
      Base64EncodedString,
      ...Base64EncodedString[],
    ];

    return {
      encryptedMessage,
      encryptedShares,
    };
  }

  protected stringToPrimaryKeyEncryptedMessage(
    message: string,
  ): PrimaryKeyEncryptedMessage {
    const [primaryKeyEncryptedMessage, multisigKeyEncryptedMessage] =
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      deserialize(message) as [Base64EncodedString, string];
    return {
      primaryKeyEncryptedMessage,
      multisigKeyEncryptedMessage: this.stringToMultisigKeyEncryptedMessage(
        multisigKeyEncryptedMessage,
      ),
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
    const [decryptedMessages, rest] = splitAt(
      this.payload.decryptMessages.length,
      result.decryptedMessages,
    );
    const [
      decryptedPrimaryKeyEncryptedMessagesShares,
      decryptedMultisigKeyEncryptedMessagesShares,
    ] = splitAt(this.payload.decryptPrimaryKeyEncryptedMessages.length, rest);

    return {
      signedHashes: result.signedHashes,
      decryptedMessages,
      decryptedPrimaryKeyEncryptedMessagesShares:
        decryptedPrimaryKeyEncryptedMessagesShares.map((message) => {
          return Base64EncodedString.parse(message);
        }),
      decryptedMultisigKeyEncryptedMessagesShares:
        decryptedMultisigKeyEncryptedMessagesShares.map((share) => {
          return Base64EncodedString.parse(share);
        }),
    };
  }

  protected getMessagesToDecrypt(publicKey: string) {
    return [
      ...this.payload.decryptMessages,
      ...this.payload.decryptPrimaryKeyEncryptedMessages.map((m) => {
        return this.stringToPrimaryKeyEncryptedMessage(m)
          .multisigKeyEncryptedMessage.encryptedShares[publicKey]!;
      }),
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
    const [encryptedMessage, ...encryptedShares] = deserialize(message) as [
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

  protected stringToPrimaryKeyEncryptedMessage(
    message: string,
  ): NewPrimaryKeyEncryptedMessage {
    const [primaryKeyEncryptedMessage, multisigKeyEncryptedMessage] =
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      deserialize(message) as [Base64EncodedString, string];
    return {
      primaryKeyEncryptedMessage,
      multisigKeyEncryptedMessage: this.stringToMultisigKeyEncryptedMessage(
        multisigKeyEncryptedMessage,
      ),
    };
  }
}
