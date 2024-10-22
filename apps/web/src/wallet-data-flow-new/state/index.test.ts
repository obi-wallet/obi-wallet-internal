import { MOCK_PRIMARY_KEY_KEYPAIR } from "@/mocks/multisig-key";
import { MOCK_WALLET_WITH_RECOVERY_KEY } from "@/mocks/wallet";
import { getOwnerData } from "@/wallet-data-backup/worker-client";
import {
  InitialState,
  WalletDataFlowStateType,
} from "@/wallet-data-flow-new/state/index";
import { SecretJsHomeChainId, WalletData } from "@obi-wallet/sdk";
// eslint-disable-next-line import/no-extraneous-dependencies
import { http, HttpResponse } from "msw";
// eslint-disable-next-line import/no-extraneous-dependencies
import { setupServer } from "msw/node";
import invariant from "tiny-invariant";

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

  const state = new InitialState({ chainId: SecretJsHomeChainId.MAINNET });
  const nextState = await state.setRecoverPublicKey(
    MOCK_PRIMARY_KEY_KEYPAIR.publicKey,
  );
  expect(nextState._tag).toEqual(WalletDataFlowStateType.NoWalletFound);

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

  const state = new InitialState({ chainId: SecretJsHomeChainId.MAINNET });
  const nextState = await state.setRecoverPublicKey(
    MOCK_PRIMARY_KEY_KEYPAIR.publicKey,
  );
  invariant(nextState._tag === WalletDataFlowStateType.DecryptData);
  expect(nextState.recoverKeyPublicKey).toEqual(
    MOCK_PRIMARY_KEY_KEYPAIR.publicKey,
  );
  expect(nextState.walletData).toEqual(data);

  server.close();
});
