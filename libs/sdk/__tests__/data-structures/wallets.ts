import { faker } from "@faker-js/faker";
import { waitFor } from "@testing-library/react-native";
import { isObservable, isObservableProp } from "mobx";

import {
  MultisigKey,
  ObservableWallets,
  SignAndBroadcastTransactionUserInteraction,
  UserInteractions,
  Wallets,
} from "../../src";
import { expectIsPureObject, generateSec256k1KeyPair } from "../__helpers__";

describe("ObservableWallets", () => {
  let wallets: Wallets;
  beforeEach(() => {
    wallets = ObservableWallets.create();
  });

  test(".empty observable", () => {
    expect(isObservable(wallets)).toEqual(true);
  });

  test(".deserialize observable", () => {
    expect(
      isObservable(
        ObservableWallets.create({
          wallets: [],
          currentWalletIndex: null,
        })
      )
    ).toEqual(true);
  });

  test(".toJSON pure", () => {
    expectIsPureObject(wallets.toJSON());
  });

  test("wallets observable", () => {
    expect(isObservable(wallets.wallets)).toEqual(true);
  });

  test("currentChainId observable", () => {
    expect(isObservableProp(wallets, "_currentChainId")).toEqual(true);
  });

  test("currentWalletIndexPerChain observable", () => {
    expect(isObservableProp(wallets, "_currentWalletIndexPerChain")).toEqual(
      true
    );
  });
});

test("create wallet", async () => {
  faker.seed(42);

  const wallets = Wallets.create();
  const userInteractions = UserInteractions.create();
  const multisigKey = MultisigKey.create("phoenix-1");

  const deviceKeyPair = generateSec256k1KeyPair();
  multisigKey.setDeviceKey(deviceKeyPair.publicKey);

  const mockPhoneKeyPair = generateSec256k1KeyPair();
  multisigKey.setPhoneKey({
    publicKey: mockPhoneKeyPair.publicKey,
    phoneNumber: faker.phone.number("+49##########"),
    securityQuestion: "birthplace",
  });

  const createWalletPromise = wallets.createWallet({
    multisigKey,
    demoMode: true,
  });
  await waitFor(() => {
    expect(
      userInteractions.hasPendingUserInteractionsOfType(
        SignAndBroadcastTransactionUserInteraction
      )
    ).toEqual(true);
  });
  const userInteraction = userInteractions.getPendingUserInteractionsOfType(
    SignAndBroadcastTransactionUserInteraction
  )[0];

  expect(userInteraction.payload.messages).toMatchInlineSnapshot(`
    [
      "{"@type":"/cosmwasm.wasm.v1.MsgExecuteContract","contract":"terra1a9zykuft0ngvq6ug2j60hz0an2kz72c3vs73tj5m87xcm0dt8w2sdkflln","funds":[],"msg":{"new_account":{"fee_debt":0,"gatekeeper_authorizations":{"beneficiary_auths":[],"message_auths":[],"session_keys":[],"spendlimit_auths":[]},"owner":"terra1fjctx996zndxxvcvyx9a8w5gthtnhptzllzp4t","signers":{"signers":[{"address":"terra1wmnxjjc3tpcw3l7u2qypvxrqzjwlre9aj6vd3e","ty":"device"},{"address":"terra1nmme5gjwhucd0a9ag4tay2sjc4dleyzku954qp","ty":"phone"}]},"update_delay":0}},"sender":"terra1fjctx996zndxxvcvyx9a8w5gthtnhptzllzp4t"}",
    ]
  `);

  const log = [
    {
      events: [
        {
          type: "instantiate",
          attributes: [
            {
              key: "_contract_address",
              value: "proxy",
            },
          ],
        },
      ],
    },
  ];

  userInteraction.resolve({
    approved: true,
    payload: {
      rawLog: JSON.stringify(log),
      success: true,
      rawResult: null,
      transactionHash: "foo",
    },
  });

  const response = await createWalletPromise;
  expect(response.approved && response.payload.success).toEqual(true);
  expect(wallets.currentWallet).toBeDefined();
  expect(wallets.currentWallet?.address).toEqual("proxy");
});
