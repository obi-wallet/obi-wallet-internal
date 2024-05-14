import {
  IntentionsHandler,
  IntentionsPayload,
} from "@/keys/intentions-handler/abstract";
import {
  PhoneSingleKeyMetaData,
  SingleKeyMetaData,
  TelegramSingleKeyMetaData,
} from "@/stores/key-meta-data";
import { Base64EncodedString, Encoding } from "@obi-wallet/encoding";
import { Key, KeyType } from "@obi-wallet/sdk";
import invariant from "tiny-invariant";

export type PhoneKeyWorkerVia = "sms" | "voice" | "telegram";

export class PhoneKeyWorkerClient {
  protected answer: string;
  protected via: PhoneKeyWorkerVia;
  protected to: string;
  protected signHashes: string[];
  protected decryptMessages: string[];

  public constructor({
    answer,
    via,
    to,
    decryptMessages,
    signHashes,
  }: {
    answer: string;
    via: PhoneKeyWorkerVia;
    to: string;
    decryptMessages: string[];
    signHashes: Base64EncodedString[];
  }) {
    this.answer = answer;
    this.via = via;
    this.to = to;
    this.decryptMessages = decryptMessages;
    this.signHashes = signHashes;
  }

  public async requestMagicCode() {
    const response = await this.genericRequest();
    if (!response.ok) {
      throw new Error("Failed to send magic code");
    }
  }

  public async confirmMagicCode(code: string): Promise<{
    publicKey: Base64EncodedString;
    decryptedMessages: string[];
    signedHashes: Base64EncodedString[];
  }> {
    const response = await this.genericRequest(code);
    if (!response.ok) {
      throw new Error("Failed to handle magic code");
    }
    return await response.json();
  }

  protected async genericRequest(code?: string) {
    return await fetch(
      `https://phone-keys.obiwallet.workers.dev/handle${code ? `?code=${code}` : ""}`,
      {
        method: "POST",
        body: JSON.stringify({
          to: this.to,
          answer: this.answer,
          via: this.via,
          signHashes: this.signHashes,
          decryptMessages: this.decryptMessages,
        }),
      },
    );
  }
}

export class PhoneKeyIntentionsHandler extends IntentionsHandler {
  protected via: PhoneKeyWorkerVia;
  protected to: string;
  protected answer: string;

  public constructor({
    key,
    keyMetaData,
    index,
    payload,
    answer,
  }: {
    key: Key;
    keyMetaData: SingleKeyMetaData;
    index: number;
    payload: IntentionsPayload;
    answer: string;
  }) {
    super({ key, keyMetaData, index, payload });
    this.answer = answer;

    switch (key.type) {
      case KeyType.Phone:
        this.via = "sms";
        this.to = PhoneSingleKeyMetaData.parse(keyMetaData).payload.phoneNumber;
        break;
      case KeyType.Telegram:
        this.via = "telegram";
        this.to = TelegramSingleKeyMetaData.parse(keyMetaData).payload.chatId;
        break;
      default:
        throw new Error("Invalid key type");
    }
  }

  public async requestMagicCode() {
    const client = new PhoneKeyWorkerClient({
      answer: this.answer,
      via: this.via,
      to: this.to,
      decryptMessages: this.messagesToDecrypt,
      signHashes: this.payload.signHashes.map((hash) => {
        return Encoding.fromBytes(hash).toBase64();
      }),
    });
    await client.requestMagicCode();
  }

  public async confirmMagicCode(code: string) {
    const client = new PhoneKeyWorkerClient({
      answer: this.answer,
      via: this.via,
      to: this.to,
      decryptMessages: this.messagesToDecrypt,
      signHashes: this.payload.signHashes.map((hash) => {
        return Encoding.fromBytes(hash).toBase64();
      }),
    });
    const response = await client.confirmMagicCode(code);

    invariant(
      response.publicKey === this.key.publicKey.value,
      "Public keys do not match, wrong to/answer combination",
    );
    return this.toIntentionsResult({
      signedHashes: response.signedHashes.map((hash) => {
        return Encoding.fromBase64(hash).toBytes();
      }),
      decryptedMessages: response.decryptedMessages,
    });
  }
}
