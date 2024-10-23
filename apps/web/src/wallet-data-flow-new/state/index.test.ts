import { MOCK_PRIMARY_KEY_KEYPAIR } from "@/mocks/multisig-key";
import { MOCK_WALLET_WITH_RECOVERY_KEY } from "@/mocks/wallet";
import { getOwnerData } from "@/wallet-data-backup/worker-client";
import {
  InitialState,
  NoWalletFoundState,
  WalletDataFlowState,
  WalletDataFlowStateType,
  WalletDataState,
} from "@/wallet-data-flow-new/state/index";
import { SecretJsHomeChainId, WalletData } from "@obi-wallet/sdk";
import { Effect, Layer, Ref, SubscriptionRef } from "effect";
// eslint-disable-next-line import/no-extraneous-dependencies
import { http, HttpResponse } from "msw";
// eslint-disable-next-line import/no-extraneous-dependencies
import { setupServer } from "msw/node";
import invariant from "tiny-invariant";

function runTest(p: Effect.Effect<void, never, WalletDataFlowState>) {
  return Effect.runPromise(
    Effect.provide(
      p,
      Layer.succeed(
        WalletDataFlowState,
        Effect.runSync(
          SubscriptionRef.make<
            InitialState | NoWalletFoundState | WalletDataState
          >(
            new InitialState({
              chainId: SecretJsHomeChainId.MAINNET,
            }),
          ),
        ),
      ),
    ),
  );
}

test("Recover by primary key, no wallets found", async () => {
  const server = setupServer(
    http.get(
      "https://wallets.obiwallet.workers.dev/secret-4/key/AxakNsuvFvIHV9rsSMKxLi%2Fyb6mCS09YQ06hM69mKedP",
      () => {
        return HttpResponse.json({ success: false }, { status: 404 });
      },
    ),
  );
  server.listen();

  await runTest(
    Effect.gen(function* () {
      const ref = yield* WalletDataFlowState;
      const state = yield* Ref.get(ref);
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      yield* (state as InitialState).setRecoverPublicKey(
        MOCK_PRIMARY_KEY_KEYPAIR.publicKey,
      );
      expect((yield* Ref.get(ref))._tag).toEqual(
        WalletDataFlowStateType.NoWalletFound,
      );
    }),
  );

  server.close();
});

test("Recover by primary key, wallet found", async () => {
  const data = WalletData.parse({
    homeChainId: MOCK_WALLET_WITH_RECOVERY_KEY.homeChain,
    userEntryAddress: MOCK_WALLET_WITH_RECOVERY_KEY.userEntryAddress,
    owner: getOwnerData(MOCK_WALLET_WITH_RECOVERY_KEY.owner),
    encryptedShares: MOCK_WALLET_WITH_RECOVERY_KEY.encryptedShares,
    // TODO:
    encryptedKeyMetaData: "[]",
    ed25519KeyPair: MOCK_WALLET_WITH_RECOVERY_KEY.ed25519KeyPair,
    revision: MOCK_WALLET_WITH_RECOVERY_KEY.previousWalletData?.revision ?? 0,
  });

  const server = setupServer(
    http.get(
      "https://wallets.obiwallet.workers.dev/secret-4/key/AxakNsuvFvIHV9rsSMKxLi%2Fyb6mCS09YQ06hM69mKedP",
      () => {
        return HttpResponse.json(data);
      },
    ),
  );
  server.listen();

  await runTest(
    Effect.gen(function* () {
      const ref = yield* WalletDataFlowState;
      const state = yield* Ref.get(ref);
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      yield* (state as InitialState).setRecoverPublicKey(
        MOCK_PRIMARY_KEY_KEYPAIR.publicKey,
      );
      const nextState = yield* Ref.get(ref);
      invariant(nextState._tag === WalletDataFlowStateType.WalletData);
      expect(nextState.walletData).toEqual(data);
    }),
  );

  server.close();
});
