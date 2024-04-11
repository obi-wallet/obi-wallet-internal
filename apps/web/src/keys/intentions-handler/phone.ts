import {
  IntentionsHandler,
  IntentionsPayload,
} from "@/keys/intentions-handler/abstract";
import { KeySubclassTypeMapping, KeyType } from "@obi-wallet/sdk";

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
    signHashes: string[];
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
    publicKey: string;
    decryptedMessages: string[];
    signedHashes: string[];
  }> {
    const response = await this.genericRequest(code);
    if (!response.ok) {
      throw new Error("Failed to handle magic code");
    }
    return response.json();
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
    index,
    payload,
    answer,
  }: {
    key:
      | KeySubclassTypeMapping[KeyType.Phone]
      | KeySubclassTypeMapping[KeyType.Telegram];
    index: number;
    payload: IntentionsPayload;
    answer: string;
  }) {
    super({ key, index, payload });
    this.answer = answer;

    switch (key.type) {
      case KeyType.Phone:
        this.via = "sms";
        this.to = key.payload.phoneNumber;
        break;
      case KeyType.Telegram:
        this.via = "telegram";
        this.to = key.payload.chatId;
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
      signHashes: this.payload.signHashes.map((hash) =>
        Buffer.from(hash).toString("base64"),
      ),
    });
    await client.requestMagicCode();
  }

  public async confirmMagicCode(code: string) {
    const client = new PhoneKeyWorkerClient({
      answer: this.answer,
      via: this.via,
      to: this.to,
      decryptMessages: this.messagesToDecrypt,
      signHashes: this.payload.signHashes.map((hash) =>
        Buffer.from(hash).toString("base64"),
      ),
    });
    const response = await client.confirmMagicCode(code);
    return this.toIntentionsResult({
      signedHashes: response.signedHashes.map((hash) => {
        return Buffer.from(hash, "base64");
      }),
      decryptedMessages: response.decryptedMessages,
    });
  }
}
