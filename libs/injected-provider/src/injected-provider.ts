import { EncodeObject } from "@cosmjs/proto-signing";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { InjectedKeplr } from "@keplr-wallet/provider";
import { KeplrMode } from "@keplr-wallet/types";
import { Keplr as IKeplr } from "@keplr-wallet/types/build/wallet/keplr";

/* eslint-disable @typescript-eslint/no-explicit-any */
export class RNInjectedKeplr extends InjectedKeplr {
  static parseWebviewMessage(message: any): any {
    if (message && typeof message === "string") {
      try {
        return JSON.parse(message);
      } catch {
        // noop
      }
    }

    return message;
  }

  protected requestMethod(
    method: keyof RNInjectedKeplr,
    args: any[]
  ): Promise<any> {
    return super.requestMethod(method as keyof IKeplr, args);
  }

  public async obiSignAndBroadcast(
    address: string,
    messages: EncodeObject[]
  ): Promise<DeliverTxResponse> {
    return await this.requestMethod("obiSignAndBroadcast", [address, messages]);
  }

  constructor(version: string, mode: KeplrMode) {
    super(
      version,
      mode,
      {
        addMessageListener: (fn: (e: any) => void) =>
          window.addEventListener("message", fn),
        removeMessageListener: (fn: (e: any) => void) =>
          window.removeEventListener("message", fn),
        postMessage: (message) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        },
      },
      RNInjectedKeplr.parseWebviewMessage
    );
  }
}
