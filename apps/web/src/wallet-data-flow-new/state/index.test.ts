import { MOCK_MPC_DISTRIBUTE_SHARES_RESPONSE } from "@/mocks/mpc";
import {
  MOCK_PRIMARY_KEY_KEYPAIR,
  MOCK_RECOVERY_KEY_KEYPAIR,
} from "@/mocks/multisig-key";
import { MOCK_WALLET_WITH_RECOVERY_KEY } from "@/mocks/wallet";
import { getOwnerData } from "@/wallet-data-backup/worker-client";
import {
  InitialState,
  NoWalletFoundState,
  WalletDataFlowState,
  WalletDataFlowStateType,
  WalletDataState,
} from "@/wallet-data-flow-new/state/index";
import { KeyType, SecretJsHomeChainId, WalletData } from "@obi-wallet/sdk";
import { Effect, Layer, Ref, SubscriptionRef } from "effect";
// eslint-disable-next-line import/no-extraneous-dependencies
import { http, HttpResponse } from "msw";
// eslint-disable-next-line import/no-extraneous-dependencies
import { setupServer } from "msw/node";
import invariant from "tiny-invariant";

const server = setupServer();

beforeAll(() => {
  return server.listen();
});

afterEach(() => {
  return server.resetHandlers();
});

afterAll(() => {
  return server.close();
});

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
  server.resetHandlers(
    http.get(
      "https://wallets.obiwallet.workers.dev/secret-4/key/AxakNsuvFvIHV9rsSMKxLi%2Fyb6mCS09YQ06hM69mKedP",
      () => {
        return HttpResponse.json({ success: false }, { status: 404 });
      },
    ),
  );

  await runTest(
    Effect.gen(function* () {
      const ref = yield* WalletDataFlowState;
      const state = yield* Ref.get(ref);
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      yield* (state as InitialState).recoverByPublicKey({
        publicKey: MOCK_PRIMARY_KEY_KEYPAIR.publicKey,
        keyMetaData: null,
      });
      expect((yield* Ref.get(ref))._tag).toEqual(
        WalletDataFlowStateType.NoWalletFound,
      );
    }),
  );
});

test("Recover by recovery key, wallets found", async () => {
  const data = WalletData.parse({
    homeChainId: MOCK_WALLET_WITH_RECOVERY_KEY.homeChain,
    userEntryAddress: MOCK_WALLET_WITH_RECOVERY_KEY.userEntryAddress,
    owner: getOwnerData(MOCK_WALLET_WITH_RECOVERY_KEY.owner),
    encryptedShares: MOCK_WALLET_WITH_RECOVERY_KEY.encryptedShares,
    encryptedKeyMetaData: "[]",
    ed25519KeyPair: MOCK_WALLET_WITH_RECOVERY_KEY.ed25519KeyPair,
    revision: MOCK_WALLET_WITH_RECOVERY_KEY.previousWalletData?.revision ?? 0,
  });
  server.resetHandlers(
    http.get(
      "https://wallets.obiwallet.workers.dev/secret-4/key/Ag3Rn%2BtkO9d8lqjd2wAQX2GVBA8ea%2BjGVWoNcGZ8YD4W",
      () => {
        return HttpResponse.json(data);
      },
    ),
  );

  await runTest(
    Effect.gen(function* () {
      const ref = yield* WalletDataFlowState;
      const state = yield* Ref.get(ref);
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      yield* (state as InitialState).recoverByPublicKey({
        publicKey: MOCK_RECOVERY_KEY_KEYPAIR.publicKey,
        keyMetaData: {
          name: "foobar",
        },
      });
      const nextState = yield* Ref.get(ref);
      invariant(nextState._tag === WalletDataFlowStateType.WalletData);
      expect(nextState.walletData).toEqual(data);
      expect(nextState.owner.primaryKey).toEqual(null);
      console.log(nextState.keyMetaData);
      expect(
        nextState.keyMetaData[MOCK_RECOVERY_KEY_KEYPAIR.publicKey.value]?.name,
      ).toEqual("foobar");
    }),
  );
});

describe("Recover by primary key, wallet found", () => {
  const data = WalletData.parse({
    homeChainId: MOCK_WALLET_WITH_RECOVERY_KEY.homeChain,
    userEntryAddress: MOCK_WALLET_WITH_RECOVERY_KEY.userEntryAddress,
    owner: getOwnerData(MOCK_WALLET_WITH_RECOVERY_KEY.owner),
    encryptedShares: MOCK_WALLET_WITH_RECOVERY_KEY.encryptedShares,
    encryptedKeyMetaData: "[]",
    ed25519KeyPair: MOCK_WALLET_WITH_RECOVERY_KEY.ed25519KeyPair,
    revision: MOCK_WALLET_WITH_RECOVERY_KEY.previousWalletData?.revision ?? 0,
  });
  const recoverByPrimaryKey = Effect.gen(function* () {
    const ref = yield* WalletDataFlowState;
    const state = yield* Ref.get(ref);
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    yield* (state as InitialState).recoverByPublicKey({
      publicKey: MOCK_PRIMARY_KEY_KEYPAIR.publicKey,
      keyMetaData: null,
    });
    const nextState = yield* Ref.get(ref);
    invariant(nextState._tag === WalletDataFlowStateType.WalletData);
    expect(nextState.walletData).toEqual(data);
    expect(nextState.owner.primaryKey).toEqual({
      type: KeyType.Passkey,
      publicKey: MOCK_PRIMARY_KEY_KEYPAIR.publicKey,
    });
  });

  beforeEach(() => {
    server.resetHandlers(
      http.get(
        "https://wallets.obiwallet.workers.dev/secret-4/key/AxakNsuvFvIHV9rsSMKxLi%2Fyb6mCS09YQ06hM69mKedP",
        () => {
          return HttpResponse.json(data);
        },
      ),
    );
  });

  test("cancel", async () => {
    await runTest(
      Effect.gen(function* () {
        yield* recoverByPrimaryKey;

        const ref = yield* WalletDataFlowState;
        const state = yield* Ref.get(ref);
        invariant(state._tag === WalletDataFlowStateType.WalletData);
        yield* state.cancel();
        expect((yield* Ref.get(ref))._tag).toEqual(
          WalletDataFlowStateType.Initial,
        );
      }),
    );
  });

  test("setDecryptedData", async () => {
    await runTest(
      Effect.gen(function* () {
        yield* recoverByPrimaryKey;

        const ref = yield* WalletDataFlowState;
        const state = yield* Ref.get(ref);
        invariant(state._tag === WalletDataFlowStateType.WalletData);
        yield* state.setDecryptedData({
          easyShare: MOCK_MPC_DISTRIBUTE_SHARES_RESPONSE.easyShare,
          backupShare: MOCK_MPC_DISTRIBUTE_SHARES_RESPONSE.backupShare,
          keyMetaData: {},
          ed25519KeyPair: null,
        });
      }),
    );
  });
});
