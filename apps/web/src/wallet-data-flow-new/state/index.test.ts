import { EffectStateValue } from "@/hooks/use-effect-state";
import {
  MOCK_PRIMARY_KEY_KEYPAIR,
  MOCK_RECOVERY_KEY_KEYPAIR,
} from "@/mocks/multisig-key";
import { MOCK_WALLET_WITH_RECOVERY_KEY } from "@/mocks/wallet";
import { getOwnerData } from "@/wallet-data-backup/worker-client";
import {
  EncryptionTools,
  InitialState,
  WalletDataFlowState,
  WalletDataFlowStateType,
} from "@/wallet-data-flow-new/state/index";
import {
  EncryptedBackupShare,
  EncryptedEasyShareForBackup,
  EncryptedEasyShareForClient,
  KeyType,
  MultisigKeyEncryptedData,
  SecretJsHomeChainId,
  WalletData,
} from "@obi-wallet/sdk";
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

function runTest(
  p: Effect.Effect<void, never, EncryptionTools | WalletDataFlowState>,
) {
  const walletDataFlowStateLayer = Layer.succeed(
    WalletDataFlowState,
    Effect.runSync(
      SubscriptionRef.make<EffectStateValue<typeof WalletDataFlowState>>(
        new InitialState({
          chainId: SecretJsHomeChainId.MAINNET,
        }),
      ),
    ),
  );
  const mockEncryptionToolsLayer = Layer.succeed(EncryptionTools, {
    encryptSharesForClient: async function (_) {
      return {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        easy: "<EncryptedEasyShareForClient>" as EncryptedEasyShareForClient,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        backup: "<EncryptedBackupShare>" as EncryptedBackupShare,
      };
    },
    encryptSharesForBackup: async function (_) {
      return {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        easy: "<EncryptedEasyShareForBackup>" as EncryptedEasyShareForBackup,
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        backup: "<EncryptedBackupShare>" as EncryptedBackupShare,
      };
    },
    encryptWithMultisigKey: async function (_) {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return "<MultisigKeyEncryptedData>" as MultisigKeyEncryptedData;
    },
    // @ts-expect-error mock
    handleIntentions: async function ({ intentionsPayload }) {
      return {
        decryptedEasyShare: intentionsPayload.decryptEasyShare,
        decryptedPrimaryKeyEncryptedMessages:
          intentionsPayload.decryptPrimaryKeyEncryptedMessages,
        decryptedMultisigKeyEncryptedMessages:
          intentionsPayload.decryptMultisigKeyEncryptedMessages,
      };
    },
  });
  const layer = Layer.merge(walletDataFlowStateLayer, mockEncryptionToolsLayer);
  return Effect.runPromise(Effect.provide(p, layer));
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
      let state = yield* Ref.get(ref);
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      yield* (state as InitialState).recoverByPublicKey({
        publicKey: MOCK_RECOVERY_KEY_KEYPAIR.publicKey,
        keyMetaData: {
          name: "foobar",
        },
      });
      state = yield* Ref.get(ref);
      invariant(state._tag === WalletDataFlowStateType.WalletData);
      expect(state.walletData).toEqual(data);
      expect(state.owner.primaryKey).toEqual(null);
      expect(
        state.keyMetaData[MOCK_RECOVERY_KEY_KEYPAIR.publicKey.value]?.name,
      ).toEqual("foobar");
      // TODO: mock approve intentions
      // console.log(state.intentionsPayload);
      // yield* state.setIntentionsResults({});
      // yield* state.setDecryptedData({
      //   easyShare: MOCK_MPC_DISTRIBUTE_SHARES_RESPONSE.easyShare,
      //   backupShare: MOCK_MPC_DISTRIBUTE_SHARES_RESPONSE.backupShare,
      //   keyMetaData: {},
      //   ed25519KeyPair: null,
      // });
      // state = yield* Ref.get(ref);
      // expect(state._tag).toEqual(WalletDataFlowStateType.SecuritySettings);
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

  test("setDecryptedData, ed25519 key pair", async () => {
    await runTest(
      Effect.gen(function* () {
        yield* recoverByPrimaryKey;

        const ref = yield* WalletDataFlowState;
        const state = yield* Ref.get(ref);
        invariant(state._tag === WalletDataFlowStateType.WalletData);
        // TODO:
        // yield* state.setDecryptedData({
        //   easyShare: MOCK_MPC_DISTRIBUTE_SHARES_RESPONSE.easyShare,
        //   backupShare: MOCK_MPC_DISTRIBUTE_SHARES_RESPONSE.backupShare,
        //   keyMetaData: {},
        //   ed25519KeyPair: {
        //     // TODO: mock key pair
        //     publicKey: {
        //       type: "tendermint/PubKeyEd25519",
        //       // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        //       value: "foobar" as Base58EncodedString,
        //     },
        //     // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        //     privateKey: "barfoo" as Base58EncodedString,
        //   },
        // });
        // const nextState = yield* Ref.get(ref);
        // expect(nextState._tag).toEqual(WalletDataFlowStateType.Done);
      }),
    );
  });

  test("setDecryptedData, no ed25519 key pair", async () => {
    await runTest(
      Effect.gen(function* () {
        yield* recoverByPrimaryKey;

        const ref = yield* WalletDataFlowState;
        const state = yield* Ref.get(ref);
        invariant(state._tag === WalletDataFlowStateType.WalletData);
        // TODO:
        // yield* state.setDecryptedData({
        //   easyShare: MOCK_MPC_DISTRIBUTE_SHARES_RESPONSE.easyShare,
        //   backupShare: MOCK_MPC_DISTRIBUTE_SHARES_RESPONSE.backupShare,
        //   keyMetaData: {},
        //   ed25519KeyPair: null,
        // });
        // const nextState = yield* Ref.get(ref);
        // expect(nextState._tag).toEqual(WalletDataFlowStateType.SetWalletData);
      }),
    );
  });
});
