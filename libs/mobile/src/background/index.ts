import { BACKGROUND_PORT, Env, Message } from "@keplr-wallet/router";
import { init, KeyRingService, ScryptParams } from "@obi-wallet/background";
import {
  CommunityChainInfoRepo,
  EmbedChainInfos,
  KVStore,
  MessageRequesterInternalToUi,
  ObiMessage,
  PrivilegedOrigins,
  produceEnv,
  RequestObiCosmosSignAndBroadcastMsg,
  RequestObiInAppPurchaseMsg,
  RequestObiTerraSignAndBroadcastMsg,
  RouterBackground,
} from "@obi-wallet/common";
import { Buffer } from "buffer";
import scrypt from "scrypt-js";

export function initBackground() {
  let keyRingService: KeyRingService;
  const router = new RouterBackground(produceEnv);

  const { interactionService } = init(
    router,
    (prefix: string) => new KVStore(prefix),
    new MessageRequesterInternalToUi(),
    EmbedChainInfos,
    PrivilegedOrigins,
    CommunityChainInfoRepo,
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
    },
    {
      create: (params: {
        iconRelativeUrl?: string;
        title: string;
        message: string;
      }) => {
        console.log(`Notification: ${params.title}, ${params.message}`);
        // browser.notifications.create({
        //   type: "basic",
        //   iconUrl: params.iconRelativeUrl
        //     ? browser.runtime.getURL(params.iconRelativeUrl)
        //     : undefined,
        //   title: params.title,
        //   message: params.message,
        // });
      },
    },
    {},
    {},
    (store, embedChainInfos, commonCrypto) => {
      keyRingService = new KeyRingService(store, embedChainInfos, commonCrypto);
      return keyRingService;
    }
  );

  router.registerMessage(RequestObiInAppPurchaseMsg);
  router.registerMessage(RequestObiCosmosSignAndBroadcastMsg);
  router.registerMessage(RequestObiTerraSignAndBroadcastMsg);
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
