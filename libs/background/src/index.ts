import * as Interaction from "@keplr-wallet/background/build/interaction/internal";
import { CommonCrypto } from "@keplr-wallet/background/build/keyring";
import { MessageRequester, Router } from "@keplr-wallet/router";

export * from "@keplr-wallet/background/build/persistent-memory";
export * from "@keplr-wallet/background/build/chains";
export * from "@keplr-wallet/background/build/ledger";
export * from "@keplr-wallet/background/build/keyring";
export * from "@keplr-wallet/background/build/secret-wasm";
export * from "@keplr-wallet/background/build/tx";
export * from "@keplr-wallet/background/build/updater";
export * from "@keplr-wallet/background/build/tokens";
export * from "@keplr-wallet/background/build/interaction";
export * from "@keplr-wallet/background/build/permission";
export * from "@keplr-wallet/background/build/phishing-list";

export function init(
  router: Router,
  // Message requester to the content script.
  eventMsgRequester: MessageRequester,
  commonCrypto: CommonCrypto
) {
  const interactionService = new Interaction.InteractionService(
    eventMsgRequester,
    commonCrypto.rng
  );

  Interaction.init(router, interactionService);

  return {
    interactionService,
  };
}
