import * as Chains from "@keplr-wallet/background/build/chains/internal";
import * as Interaction from "@keplr-wallet/background/build/interaction/internal";
import { CommonCrypto } from "@keplr-wallet/background/build/keyring";
import * as KeyRing from "@keplr-wallet/background/build/keyring/internal";
import * as Ledger from "@keplr-wallet/background/build/ledger/internal";
import { LedgerOptions } from "@keplr-wallet/background/build/ledger/options";
import * as Permission from "@keplr-wallet/background/build/permission/internal";
import * as PersistentMemory from "@keplr-wallet/background/build/persistent-memory/internal";
import * as PhishingList from "@keplr-wallet/background/build/phishing-list/internal";
import * as SecretWasm from "@keplr-wallet/background/build/secret-wasm/internal";
import * as Tokens from "@keplr-wallet/background/build/tokens/internal";
import { Notification } from "@keplr-wallet/background/build/tx";
import * as BackgroundTx from "@keplr-wallet/background/build/tx/internal";
import * as Updater from "@keplr-wallet/background/build/updater/internal";
import { KVStore } from "@keplr-wallet/common";
import { MessageRequester, Router } from "@keplr-wallet/router";
import { ChainInfo } from "@keplr-wallet/types";

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
  storeCreator: (prefix: string) => KVStore,
  // Message requester to the content script.
  eventMsgRequester: MessageRequester,
  embedChainInfos: ChainInfo[],
  // The origins that are able to pass any permission.
  privilegedOrigins: string[],
  communityChainInfoRepo: {
    readonly organizationName: string;
    readonly repoName: string;
    readonly branchName: string;
  },
  commonCrypto: CommonCrypto,
  notification: Notification,
  ledgerOptions: Partial<LedgerOptions> = {},
  experimentalOptions: Partial<{
    suggestChain: Partial<{
      // Chains registered as suggest chains are managed in memory.
      // In other words, it disappears when the app is closed.
      // General operation should be fine. This is a temporary solution for the mobile app.
      useMemoryKVStore: boolean;
    }>;
  }> = {},
  createKeyRingService: (
    store: KVStore,
    embedChainInfos: ChainInfo[],
    commonCrypto: CommonCrypto
  ) => KeyRing.KeyRingService
) {
  const interactionService = new Interaction.InteractionService(
    eventMsgRequester,
    commonCrypto.rng
  );

  const persistentMemoryService =
    new PersistentMemory.PersistentMemoryService();

  const permissionService = new Permission.PermissionService(
    storeCreator("permission"),
    privilegedOrigins
  );

  const chainUpdaterService = new Updater.ChainUpdaterService(
    storeCreator("updator"),
    communityChainInfoRepo
  );

  const tokensService = new Tokens.TokensService(storeCreator("tokens"));

  const chainsService = new Chains.ChainsService(
    storeCreator("chains"),
    embedChainInfos,
    {
      useMemoryKVStoreForSuggestChain:
        experimentalOptions.suggestChain?.useMemoryKVStore,
    }
  );

  const ledgerService = new Ledger.LedgerService(
    storeCreator("ledger"),
    ledgerOptions
  );

  const keyRingService = createKeyRingService(
    storeCreator("keyring"),
    embedChainInfos,
    commonCrypto
  );

  const secretWasmService = new SecretWasm.SecretWasmService(
    storeCreator("secretwasm")
  );

  const backgroundTxService = new BackgroundTx.BackgroundTxService(
    notification
  );

  const phishingListService = new PhishingList.PhishingListService({
    blockListUrl:
      "https://raw.githubusercontent.com/chainapsis/phishing-block-list/main/block-list.txt",
    twitterListUrl:
      "https://raw.githubusercontent.com/chainapsis/phishing-block-list/main/twitter-scammer-list.txt",
    fetchingIntervalMs: 3 * 3600 * 1000, // 3 hours
    retryIntervalMs: 10 * 60 * 1000, // 10 mins,
    allowTimeoutMs: 10 * 60 * 1000, // 10 mins,
  });

  persistentMemoryService.init();
  permissionService.init(interactionService, chainsService, keyRingService);
  chainUpdaterService.init(chainsService);
  tokensService.init(
    interactionService,
    permissionService,
    chainsService,
    keyRingService
  );
  chainsService.init(
    chainUpdaterService,
    interactionService,
    permissionService
  );
  ledgerService.init(interactionService);
  keyRingService.init(
    interactionService,
    chainsService,
    permissionService,
    ledgerService
  );
  secretWasmService.init(chainsService, keyRingService, permissionService);
  backgroundTxService.init(chainsService, permissionService);
  phishingListService.init();

  Interaction.init(router, interactionService);
  PersistentMemory.init(router, persistentMemoryService);
  Permission.init(router, permissionService);
  Updater.init(router, chainUpdaterService);
  Tokens.init(router, tokensService);
  Chains.init(router, chainsService);
  Ledger.init(router, ledgerService);
  KeyRing.init(router, keyRingService);
  SecretWasm.init(router, secretWasmService);
  BackgroundTx.init(router, backgroundTxService);
  PhishingList.init(router, phishingListService);

  return {
    interactionService,
  };
}
