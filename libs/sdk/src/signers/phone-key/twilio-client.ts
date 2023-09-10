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

  requestSignatureMagicCode({
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

  public async parsePublicKeyMagicCodeResponse(_: { key: string }) {
    return this.keyPair.publicKey;
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
      message: `pub:${securityAnswer}`,
      phoneNumber,
      chainId,
      voice,
    });
  }

  public async parsePublicKeyMagicCodeResponse({ key }: { key: string }) {
    const decrypted = await this.fetchAndDecryptResponse(key);

    // if (!decrypted?.startsWith("pubkey:")) {
    //   throw new Error("This doesn't seem to be a public key");
    // }

    return {
      type: "tendermint/PubKeySecp256k1" as const,
      value: decrypted.pubkey,
    };
  }

  public async requestSignatureMagicCode({
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
  }) {
    await this.encryptAndSendMessage({
      message: `sign:${securityAnswer}:${Buffer.from(message.buffer).toString(
        "base64",
      )}`,
      phoneNumber,
      chainId,
      voice,
    });
  }

  public async parseSignatureMagicCodeResponse({ key }: { key: string }) {
    const response = await this.fetchAndDecryptResponse(key);
    if (!response?.startsWith("signature:")) {
      throw new Error("This doesn't seem to be a signature");
    }
    return new Uint8Array(Buffer.from(response.signature, "base64"));
  }

  protected async encryptAndSendMessage({
    message,
    phoneNumber,
    chainId,
    voice,
  }: {
    message: string;
    phoneNumber: string;
    chainId: ChainId;
    voice: boolean;
  }) {
    console.log({
      message,
    });
    const body = await this.getMessageBody(`${message}:${chainId}`);
    const formData = new FormData();
    const { twilioPhoneNumbers, twilioUrl } = Chain.information(chainId);
    const twilioPhoneNumber =
      twilioPhoneNumbers[Math.floor(Math.random() * twilioPhoneNumbers.length)];
    formData.append("To", phoneNumber);
    formData.append("From", twilioPhoneNumber);
    formData.append(
      "Parameters",
      JSON.stringify({ trigger_body: { body, voice } }),
    );

    return await fetch(twilioUrl, {
      body: formData,
      method: "post",
      headers: {
        Authorization: this.twilioConfig.authorization,
      },
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
    // totp.options = { digits: 64, step: 600 };
    // const token = totp.generate(this.twilioConfig.secret);

    // totp.verify({ token, secret: this.twilioConfig.secret });
    // console.log(message);
    // const encrypted = AES.encrypt(message, token).toString();

    const result = await fetch("https://obi-hastebin.herokuapp.com/documents", {
      headers: {
        "Content-type": "application/text",
      },
      method: "POST",
      body: message,
    });
    const { key } = JSON.parse(await result.text());
    return key;
  }
}
