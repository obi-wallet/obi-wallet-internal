import { MOCK_PRIMARY_KEY_KEYPAIR } from "@/mocks/multisig-key";
import { MOCK_WALLET_WITH_RECOVERY_KEY } from "@/mocks/wallet";
import { getOwnerData } from "@/wallet-data-backup/worker-client";
import {
  SomeOtherAction,
  transitions,
  WalletDataFlowDecryptDataState,
  WalletDataFlowInitialState,
  WalletDataFlowStateType,
} from "@/wallet-data-flow-new/state/index";
import { SecretJsHomeChainId, WalletData } from "@obi-wallet/sdk";
// eslint-disable-next-line import/no-extraneous-dependencies
import { http, HttpResponse } from "msw";
// eslint-disable-next-line import/no-extraneous-dependencies
import { setupServer } from "msw/node";

test("TS fails for non-expected actions", async () => {
  const state: WalletDataFlowInitialState = {
    type: WalletDataFlowStateType.Initial,
    payload: { chainId: SecretJsHomeChainId.MAINNET },
  };
  const action: SomeOtherAction = { type: "someOtherAction" };
  // @ts-expect-error Asserted failure
  await transitions[state.type](state, action);
});

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

  const state: WalletDataFlowInitialState = {
    type: WalletDataFlowStateType.Initial,
    payload: { chainId: SecretJsHomeChainId.MAINNET },
  };
  const nextState = await transitions[state.type](
    state,
    MOCK_PRIMARY_KEY_KEYPAIR.publicKey,
  );
  expect(nextState.type).toBe(WalletDataFlowStateType.Initial);

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

  const state: WalletDataFlowInitialState = {
    type: WalletDataFlowStateType.Initial,
    payload: { chainId: SecretJsHomeChainId.MAINNET },
  };
  const nextState = await transitions[state.type](
    state,
    MOCK_PRIMARY_KEY_KEYPAIR.publicKey,
  );
  expect(nextState.type).toBe(WalletDataFlowStateType.DecryptData);
  expect(
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    (nextState as WalletDataFlowDecryptDataState).payload.walletData,
  ).toEqual(data);

  server.close();
});
