import { TwilioClientInterface } from "./twilio-client";
import { Chain } from "../../chains";
import { KeySubclassTypeMapping, KeyType } from "../../data-structures";
import { Signer } from "../signer";

export * from "./twilio-client";

export class PhoneKeySigner extends Signer {
  protected pendingSignature: {
    hash: Uint8Array;
    resolve: (signature: Uint8Array) => void;
  } | null = null;

  public constructor(
    protected chainId: Chain,
    protected key: KeySubclassTypeMapping[KeyType.Phone],
    protected twilioClient: TwilioClientInterface
  ) {
    super();
  }

  public get publicKey() {
    return this.key.publicKey;
  }

  public async signHash(hash: Uint8Array) {
    return new Promise<Uint8Array>((resolve) => {
      console.log("incoming hash: ", hash);
      this.pendingSignature = {
        hash,
        resolve,
      };
    });
  }

  public async requestSignature(securityAnswer: string) {
    if (!this.pendingSignature) {
      throw new Error("No pending signature found.");
    }
    const { hash } = this.pendingSignature;
    await this.twilioClient.sendSignatureTextMessage({
      phoneNumber: this.key.payload.phoneNumber,
      securityAnswer,
      message: hash,
      chainId: this.chainId,
    });
  }

  public async confirmSignature(key: string) {
    if (!this.pendingSignature) {
      throw new Error("No pending signature found.");
    }
    const { resolve } = this.pendingSignature;
    const signature = await this.twilioClient.parseSignatureTextMessageResponse(
      {
        key,
        chainId: this.chainId,
      }
    );
    resolve(signature);
    this.pendingSignature = null;
  }
}
