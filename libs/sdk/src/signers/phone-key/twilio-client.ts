import invariant from "tiny-invariant";

import { Chain, ChainId } from "../../chains";
import { Secp256k1KeyPair, Secp256k1PublicKey } from "../../keys";
import { Sdk } from "../../sdk";
import { Secp256k1PrivateKeySigner } from "../sec256k1-private-key";

export interface TwilioConfig {
  authorization: string;
  secret: string;
}

export interface TwilioClientInterface {
  requestPublicKeyMagicCode({
    phoneNumber,
    securityAnswer,
    chainId,
    type,
  }: {
    phoneNumber: string;
    securityAnswer: string;
    chainId: ChainId;
    type: ComunicationType;
  }): Promise<void>;

  parsePublicKeyMagicCodeResponse({
    key,
  }: {
    key: string;
  }): Promise<Secp256k1PublicKey>;

  parseKeyMagicCodeResponse({ key }: { key: string }): Promise<string>;

  requestSignatureMagicCode({
    phoneNumber,
    securityAnswer,
    message,
    chainId,
    type,
  }: {
    phoneNumber: string;
    securityAnswer: string;
    message: Uint8Array;
    chainId: ChainId;
    type: ComunicationType;
  }): Promise<void>;

  parseSignatureMagicCodeResponse({
    key,
    chainId,
  }: {
    key: string;
    chainId: ChainId;
  }): Promise<Uint8Array>;
}

export class DemoModeTwilioClient implements TwilioClientInterface {
  protected demoPayload: Uint8Array | null = null;

  public constructor(protected keyPair: Secp256k1KeyPair) {}

  public async requestPublicKeyMagicCode(_: {
    phoneNumber: string;
    securityAnswer: string;
    chainId: ChainId;
  }) {
    return;
  }

  public async parsePublicKeyMagicCodeResponse(_: { key: string }) {
    return this.keyPair.publicKey;
  }

  public async parseKeyMagicCodeResponse(_: { key: string }) {
    return this.keyPair.privateKey;
  }

  public async requestSignatureMagicCode({
    message,
  }: {
    phoneNumber: string;
    securityAnswer: string;
    message: Uint8Array;
    chainId: ChainId;
  }) {
    this.demoPayload = message;
    return;
  }

  public async parseSignatureMagicCodeResponse({
    chainId,
  }: {
    key: string;
    chainId: ChainId;
  }) {
    if (!this.demoPayload) {
      throw new Error("No demo payload found.");
    }
    const signer = new Secp256k1PrivateKeySigner(this.keyPair.privateKey);
    await Sdk.chainId(chainId).transactions.prepareKeyPair(this.keyPair);
    const signature = await signer.signHash(this.demoPayload);
    this.demoPayload = null;
    return signature;
  }
}
export enum ComunicationType {
  SMS = "sms",
  VOICE = "voice",
  TELEGRAM = "telegram",
}
export class TwilioClient implements TwilioClientInterface {
  public constructor(protected twilioConfig: TwilioConfig) {}

  public async requestPublicKeyMagicCode({
    phoneNumber,
    securityAnswer,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    chainId,
    type,
  }: {
    phoneNumber: string;
    securityAnswer: string;
    chainId: ChainId;
    type: ComunicationType;
  }) {
    await this.encryptAndSendMessage({
      answer: securityAnswer,
      phoneNumber,
      chainId: "pulsar-3",
      type,
    });
  }

  public async parsePublicKeyMagicCodeResponse({ key }: { key: string }) {
    const decrypted = await this.fetchAndDecryptResponse(key);

    return {
      type: "tendermint/PubKeySecp256k1" as const,
      value: decrypted, // decrypted.pubkey,
    };
  }

  stringToBase64(input: string): string {
    console.log("input in stringToBase64: " + input);
    // Convert the comma-separated string into an array of numbers
    const numbers = input.split(",").map((num) => parseInt(num, 10));

    // Convert the numbers into a Uint8Array
    const byteArray = new Uint8Array(numbers);

    // Convert the Uint8Array into a base64 string
    let binary = "";
    const len = byteArray.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(byteArray[i]);
    }
    const base64 = btoa(binary);

    return base64;
  }

  public async parseKeyMagicCodeResponse({
    key,
  }: {
    key: string;
  }): Promise<string> {
    const decrypted = await this.fetchAndDecryptResponse(key);
    // console.log("res: " + decrypted);
    // console.log("stringified res: " + JSON.stringify(decrypted));
    invariant(decrypted, "Received null haste response");
    // convert to base64
    const base64PrivKey = this.stringToBase64(decrypted);
    return base64PrivKey;
  }

  public async requestSignatureMagicCode({
    phoneNumber,
    securityAnswer,
    message,
    chainId,
    type,
  }: {
    phoneNumber: string;
    securityAnswer: string;
    message: Uint8Array;
    chainId: ChainId;
    type: ComunicationType;
  }) {
    await this.encryptAndSendMessage({
      answer: securityAnswer,
      signature: Buffer.from(message.buffer).toString("base64"),
      phoneNumber,
      chainId,
      type,
    });
  }

  public async parseSignatureMagicCodeResponse({ key }: { key: string }) {
    const response = await this.fetchAndDecryptResponse(key);
    if (!response?.startsWith("signature:")) {
      throw new Error("This doesn't seem to be a signature");
    }
    return new Uint8Array(Buffer.from(response, "base64"));

    // return new Uint8Array(Buffer.from(response.signature, "base64"));
  }

  protected async encryptAndSendMessage({
    answer,
    phoneNumber,
    chainId,
    signature,
    type,
  }: {
    answer: string;
    signature?: string;
    phoneNumber: string;
    chainId: ChainId;
    type: ComunicationType;
  }) {
    const key = await this.getMessageBody(
      JSON.stringify({
        answer,
        chainId,
        ...(signature ? { signature } : {}),
      }),
    );

    const { twilioPhoneNumbers, twilioUrl } = Chain.information(chainId);
    const twilioPhoneNumber =
      twilioPhoneNumbers[Math.floor(Math.random() * twilioPhoneNumbers.length)];

    const reqBody = {
      To: phoneNumber,
      From: twilioPhoneNumber,
      key,
      type,
    };

    return await fetch(twilioUrl, {
      body: JSON.stringify({ ...reqBody, pk: true }),
      method: "post",

      headers: new Headers({ "content-type": "application/json" }),
    });
  }

  protected async fetchAndDecryptResponse(key: string) {
    const result = await fetch(`https://obi-hastebin.herokuapp.com/raw/${key}`);
    console.log(JSON.stringify({ result }));
    const text = await result.text();
    console.log({ text });
    return text;
  }

  protected async getMessageBody(message: string) {
    console.log("getmessagebody"); // absurdly large step for dev convenience

    const result = await fetch("https://obi-hastebin.herokuapp.com/documents", {
      headers: new Headers({ "content-type": "application/json" }),
      method: "POST",
      body: message,
    });
    const data = await result.json();

    return data.key;
  }
}
