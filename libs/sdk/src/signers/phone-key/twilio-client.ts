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
    voice,
  }: {
    phoneNumber: string;
    securityAnswer: string;
    chainId: ChainId;
    voice: boolean;
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
  }: {
    phoneNumber: string;
    securityAnswer: string;
    message: Uint8Array;
    chainId: ChainId;
  }): Promise<void>;

  requestKeyMagicCode({
    phoneNumber,
    securityAnswer,
    message,
    chainId,
    voice,
  }: {
    phoneNumber: string;
    securityAnswer: string;
    message: Uint8Array;
    chainId: ChainId;
    voice: boolean;
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

  public async requestKeyMagicCode(_: {
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

export class TwilioClient implements TwilioClientInterface {
  public constructor(protected twilioConfig: TwilioConfig) {}

  public async requestPublicKeyMagicCode({
    phoneNumber,
    securityAnswer,
    chainId,
    voice,
  }: {
    phoneNumber: string;
    securityAnswer: string;
    chainId: ChainId;
    voice: boolean;
  }) {
    await this.encryptAndSendMessage({
      answer: securityAnswer,
      phoneNumber,
      chainId,
      // voice,
    });
  }

  public async parsePublicKeyMagicCodeResponse({ key }: { key: string }) {
    const decrypted = await this.fetchAndDecryptResponse(key);

    return {
      type: "tendermint/PubKeySecp256k1" as const,
      value: decrypted.pubkey,
    };
  }

  public async parseKeyMagicCodeResponse({ key }: { key: string }) {
    const decrypted = await this.fetchAndDecryptResponse(key);

    // if (!decrypted?.startsWith("pubkey:")) {
    //   throw new Error("This doesn't seem to be a public key");
    // }

    return decrypted.key;
  }

  public async requestSignatureMagicCode({
    phoneNumber,
    securityAnswer,
    message,
    chainId,
  }: {
    phoneNumber: string;
    securityAnswer: string;
    message: Uint8Array;
    chainId: ChainId;
  }) {
    await this.encryptAndSendMessage({
      answer: securityAnswer,
      signature: Buffer.from(message.buffer).toString("base64"),
      phoneNumber,
      chainId,
    });
  }

  public async requestKeyMagicCode({
    phoneNumber,
    securityAnswer,
    chainId,
    voice,
  }: {
    phoneNumber: string;
    securityAnswer: string;
    chainId: ChainId;
    voice: boolean;
  }) {
    return {
      phoneNumber,
      securityAnswer,
      chainId,
      voice,
    };
    // reenable when Jose is done
    /*
    await this.encryptAndSendMessage({
      message: `key:${securityAnswer}`,
      phoneNumber,
      chainId,
      voice,
    });
    */
  }

  public async parseSignatureMagicCodeResponse({ key }: { key: string }) {
    const response = await this.fetchAndDecryptResponse(key);
    if (!response?.startsWith("signature:")) {
      throw new Error("This doesn't seem to be a signature");
    }
    return new Uint8Array(Buffer.from(response.signature, "base64"));
  }

  protected async encryptAndSendMessage({
    answer,
    phoneNumber,
    chainId,
    signature,
  }: {
    answer: string;
    signature?: string;
    phoneNumber: string;
    chainId: ChainId;
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
    };

    return await fetch(twilioUrl, {
      body: JSON.stringify(reqBody),
      method: "post",

      headers: new Headers({ "content-type": "application/json" }),
    });
  }

  protected async fetchAndDecryptResponse(key: string) {
    const result = await fetch(`https://obi-hastebin.herokuapp.com/raw/${key}`);
    console.log({ result });
    const text = await result.json();
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
