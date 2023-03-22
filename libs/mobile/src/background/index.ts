import { BACKGROUND_PORT, Env, Message } from "@keplr-wallet/router";
import { init, ScryptParams } from "@obi-wallet/background";
import {
  MessageRequesterInternalToUi,
  ObiMessage,
  produceEnv,
  RequestObiCosmosSignAndBroadcastMsg,
  RequestObiInAppPurchaseMsg,
  RequestObiSignAndBroadcastTerraTransactionMsg,
  RouterBackground,
} from "@obi-wallet/common";
import { Buffer } from "buffer";
import scrypt from "scrypt-js";

export function initBackground() {
  const router = new RouterBackground(produceEnv);

  const { interactionService } = init(
    router,
    new MessageRequesterInternalToUi(),
    {
      rng: (array) => {
        return Promise.resolve(crypto.getRandomValues(array));
      },
      scrypt: async (text: string, params: ScryptParams) => {
        return await scrypt.scrypt(
          Buffer.from(text),
          Buffer.from(params.salt, "hex"),
          params.n,
          params.r,
          params.p,
          params.dklen
        );
      },
    }
  );

  router.registerMessage(RequestObiInAppPurchaseMsg);
  router.registerMessage(RequestObiCosmosSignAndBroadcastMsg);
  router.registerMessage(RequestObiSignAndBroadcastTerraTransactionMsg);
  router.addHandler("obi", async (env: Env, msg: Message<unknown>) => {
    const message = msg as ObiMessage;
    return await interactionService.waitApprove(
      env,
      "/",
      message.type(),
      message.payload
    );
  });

  router.listen(BACKGROUND_PORT);
}
