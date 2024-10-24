import { SingleKeyMetaData } from "@/stores/key-meta-data";
import { Base64EncodedString } from "@obi-wallet/encoding";
import {
  AesGcmEncryptedData,
  EncryptedEasyShareForClient,
  KeySchema,
  MultisigKey,
  MultisigKeyEncryptedData,
  parseMultisigKeyEncryptedData,
  parsePrimaryKeyEncryptedData,
  PrimaryKeyEncryptedData,
  Secp256k1EncryptedData,
} from "@obi-wallet/sdk";
import { fromPairs, splitAt } from "ramda";
import { z } from "zod";

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
  encryptedMessage: AesGcmEncryptedData;
  encryptedShares: Record<string, Secp256k1EncryptedData>;
}

export interface IntentionsPayload {
  signHashes: Uint8Array[];
  decryptEasyShare: EncryptedEasyShareForClient | null;
  decryptMessages: Secp256k1EncryptedData[];
  decryptPrimaryKeyEncryptedMessages: PrimaryKeyEncryptedData[];
  decryptMultisigKeyEncryptedMessages: MultisigKeyEncryptedData[];
}

export interface IntentionsResult {
  signedHashes: Uint8Array[];
  decryptedEasyShareShare: Base64EncodedString | null;
  decryptedMessages: string[];
  decryptedPrimaryKeyEncryptedMessagesShares: Base64EncodedString[];
  decryptedMultisigKeyEncryptedMessagesShares: Base64EncodedString[];
}

export abstract class IntentionsHandler {
  protected key: z.infer<typeof KeySchema>;
  protected keyMetaData: SingleKeyMetaData;
  protected index: number;
  protected payload: IntentionsPayload;

  protected constructor({
    key,
    keyMetaData,
    index,
    payload,
  }: {
    key: z.infer<typeof KeySchema>;
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
    const decryptedEasyShareShare = this.payload.decryptEasyShare
      ? rest.shift()
      : null;
    const [
      decryptedPrimaryKeyEncryptedMessagesShares,
      decryptedMultisigKeyEncryptedMessagesShares,
    ] = splitAt(this.payload.decryptPrimaryKeyEncryptedMessages.length, rest);
    return {
      signedHashes: result.signedHashes,
      decryptedMessages,
      decryptedEasyShareShare: decryptedEasyShareShare
        ? Base64EncodedString.parse(decryptedEasyShareShare)
        : null,
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
    message: MultisigKeyEncryptedData,
  ): MultisigKeyEncryptedMessage {
    const [encryptedMessage, ...encryptedShares] =
      parseMultisigKeyEncryptedData(message);

    return {
      encryptedMessage,
      encryptedShares,
    };
  }

  protected stringToPrimaryKeyEncryptedMessage(
    message: PrimaryKeyEncryptedData,
  ): PrimaryKeyEncryptedMessage {
    const [primaryKeyEncryptedMessage, multisigKeyEncryptedMessage] =
      parsePrimaryKeyEncryptedData(message);
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
    const decryptedEasyShareShare = this.payload.decryptEasyShare
      ? rest.shift()
      : null;
    const [
      decryptedPrimaryKeyEncryptedMessagesShares,
      decryptedMultisigKeyEncryptedMessagesShares,
    ] = splitAt(this.payload.decryptPrimaryKeyEncryptedMessages.length, rest);

    return {
      signedHashes: result.signedHashes,
      decryptedMessages,
      decryptedEasyShareShare: decryptedEasyShareShare
        ? Base64EncodedString.parse(decryptedEasyShareShare)
        : null,
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

  protected getMessagesToDecrypt(publicKey: string): Secp256k1EncryptedData[] {
    return [
      ...this.payload.decryptMessages,
      ...(this.payload.decryptEasyShare
        ? [
            this.stringToPrimaryKeyEncryptedMessage(
              this.payload.decryptEasyShare,
            ).multisigKeyEncryptedMessage.encryptedShares[publicKey]!,
          ]
        : []),
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
    message: MultisigKeyEncryptedData,
  ): NewMultisigKeyEncryptedMessage {
    const [encryptedMessage, ...encryptedShares] =
      parseMultisigKeyEncryptedData(message);
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
    message: PrimaryKeyEncryptedData,
  ): NewPrimaryKeyEncryptedMessage {
    const [primaryKeyEncryptedMessage, multisigKeyEncryptedMessage] =
      parsePrimaryKeyEncryptedData(message);
    return {
      primaryKeyEncryptedMessage,
      multisigKeyEncryptedMessage: this.stringToMultisigKeyEncryptedMessage(
        multisigKeyEncryptedMessage,
      ),
    };
  }
}
