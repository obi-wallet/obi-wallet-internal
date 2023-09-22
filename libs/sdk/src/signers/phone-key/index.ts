import { CommunicationType, TwilioClientInterface } from "./twilio-client";
import { ChainId } from "../../chains";
import { KeyType } from "../../data-structures";
import { AsyncKeySigner } from "../abstract";

export * from "./twilio-client";

export class PhoneKeySigner extends AsyncKeySigner<KeyType.Phone> {
  public async requestSignature({
    chainId,
    securityAnswer,
    twilioClient,
    type,
  }: {
    chainId: ChainId;
    securityAnswer: string;
    twilioClient: TwilioClientInterface;
    type: CommunicationType;
  }) {
    const { hash } = await this.waitForPendingSignature();
    console.log({ type });
    await twilioClient.requestSignatureMagicCode({
      phoneNumber: this.key.payload.phoneNumber,
      securityAnswer,
      message: hash,
      chainId,
      type,
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
    const signature = await twilioClient.parseSignatureMagicCodeResponse({
      key,
      chainId,
    });
    await this.finishSignature(signature);
  }
}
