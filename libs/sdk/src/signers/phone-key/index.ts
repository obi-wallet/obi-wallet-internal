import { TwilioClientInterface } from "./twilio-client";
import { ChainId } from "../../chains";
import { KeyType } from "../../data-structures";
import { AsyncKeySigner } from "../abstract";

export * from "./twilio-client";

export class PhoneKeySigner extends AsyncKeySigner<KeyType.Phone> {
  public async requestSignature({
    chainId,
    securityAnswer,
    twilioClient,
  }: {
    chainId: ChainId;
    securityAnswer: string;
    twilioClient: TwilioClientInterface;
  }) {
    if (!this.pendingSignature) {
      throw new Error("No pending signature found.");
    }
    const { hash } = this.pendingSignature;
    await twilioClient.sendSignatureTextMessage({
      phoneNumber: this.key.payload.phoneNumber,
      securityAnswer,
      message: hash,
      chainId,
    });
  }

  public async confirmSignature({
    chainId,
    key,
    twilioClient,
  }: {
    chainId: ChainId;
    key: string;
    twilioClient: TwilioClientInterface;
  }) {
    if (!this.pendingSignature) {
      throw new Error("No pending signature found.");
    }
    const signature = await twilioClient.parseSignatureTextMessageResponse({
      key,
      chainId,
    });
    this.finishSignature(signature);
  }
}
