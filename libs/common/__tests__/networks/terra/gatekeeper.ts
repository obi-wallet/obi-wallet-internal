import invariant from "tiny-invariant";

import { GatekeeperConfig, generateSec256k1KeyPair, terra } from "../../../src";

const proxyAddress =
  "terra19g840q54mxd5vyxh3rdfpncmmyql5hcu8j9wcg45zgwgt4phwdes27emev";
const { publicKey, privateKey } = generateSec256k1KeyPair();
const address = terra.getAddress({
  publicKey: {
    type: "tendermint/PubKeySecp256k1",
    value: publicKey,
  },
});
let gatekeepers: {
  spendLimitGatekeeper: string;
  sessionKeyGatekeeper: string;
};

beforeAll(async () => {
  const response = await terra.fetchGatekeeperContractAddresses({
    proxyAddress,
    chainId: "phoenix-1",
  });
  invariant(response.spendLimitGatekeeper, "Spend limit gatekeeper not found");
  invariant(response.sessionKeyGatekeeper, "Session key gatekeeper not found");
  gatekeepers = {
    spendLimitGatekeeper: response.spendLimitGatekeeper,
    sessionKeyGatekeeper: response.sessionKeyGatekeeper,
  };
});

describe("Empty gatekeeper config", () => {
  const currentGatekeeperConfig = new GatekeeperConfig();

  test("No changes", () => {
    const newGatekeeperConfig = new GatekeeperConfig();
    const messages = terra.getUpdateGatekeeperMessages({
      currentGatekeeperConfig,
      newGatekeeperConfig,
      proxyAddress,
      ...gatekeepers,
    });
    expect(messages).toEqual([]);
  });

  test("Add strict flex account", () => {
    const newGatekeeperConfig = new GatekeeperConfig();
    newGatekeeperConfig.addFlexAccount({
      type: "flex-account",
      meta: {
        name: "Strict Flex Account",
        icon: "",
      },
      address,
      publicKey: {
        type: "tendermint/PubKeySecp256k1",
        value: publicKey,
      },
      privateKey: privateKey,
      spendLimit: null,
      autoSign: null,
    });
    const messages = terra.getUpdateGatekeeperMessages({
      currentGatekeeperConfig,
      newGatekeeperConfig,
      proxyAddress,
      ...gatekeepers,
    });
    expect(messages.length).toEqual(1);
    expect(messages[0].toAmino()).toEqual({
      type: "wasm/MsgExecuteContract",
      value: {
        sender: proxyAddress,
        contract: gatekeepers.spendLimitGatekeeper,
        msg: {
          upsert_permissioned_address: {
            new_permissioned_address: {
              address,
              cooldown: 0,
              inheritance_records: [],
              offset: 0,
              period_multiple: 0,
              period_type: "days",
              spend_limits: [],
            },
          },
        },
        funds: [],
      },
    });
  });

  test("Add limited flex account", () => {
    const newGatekeeperConfig = new GatekeeperConfig();
    newGatekeeperConfig.addFlexAccount({
      type: "flex-account",
      meta: {
        name: "Limited Flex Account",
        icon: "",
      },
      address,
      publicKey: {
        type: "tendermint/PubKeySecp256k1",
        value: publicKey,
      },
      privateKey: privateKey,
      spendLimit: {
        period: {
          days: 1,
        },
        amount: 10,
      },
      autoSign: null,
    });
    const messages = terra.getUpdateGatekeeperMessages({
      currentGatekeeperConfig,
      newGatekeeperConfig,
      proxyAddress,
      ...gatekeepers,
    });
    expect(messages.length).toEqual(1);
    expect(messages[0].toAmino()).toEqual({
      type: "wasm/MsgExecuteContract",
      value: {
        sender: proxyAddress,
        contract: gatekeepers.spendLimitGatekeeper,
        msg: {
          upsert_permissioned_address: {
            new_permissioned_address: {
              address,
              cooldown: 0,
              inheritance_records: [],
              offset: 0,
              period_multiple: 1,
              period_type: "days",
              spend_limits: [
                {
                  amount: "10000000",
                  current_balance: "0",
                  denom:
                    "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4",
                  limit_remaining: "10000000",
                },
              ],
            },
          },
        },
        funds: [],
      },
    });
  });

  test("Add unlocked flex account", () => {
    const newGatekeeperConfig = new GatekeeperConfig();
    newGatekeeperConfig.addFlexAccount({
      type: "flex-account",
      meta: {
        name: "Unlocked Flex Account",
        icon: "",
      },
      address,
      publicKey: {
        type: "tendermint/PubKeySecp256k1",
        value: publicKey,
      },
      privateKey: privateKey,
      spendLimit: {
        period: {
          days: 1,
        },
        amount: 10,
      },
      autoSign: {
        // TODO: this doesn't make sense like that
        // Maybe not add here at all end instead query from chain?!
        endTime: "2021-01-01T00:00:00Z",
      },
    });
    const messages = terra.getUpdateGatekeeperMessages({
      currentGatekeeperConfig,
      newGatekeeperConfig,
      proxyAddress,
      ...gatekeepers,
    });
    expect(messages.length).toEqual(2);
    expect(messages.map((message) => message.toAmino())).toContainEqual({
      type: "wasm/MsgExecuteContract",
      value: {
        sender: proxyAddress,
        contract: gatekeepers.spendLimitGatekeeper,
        msg: {
          upsert_permissioned_address: {
            new_permissioned_address: {
              address,
              cooldown: 0,
              inheritance_records: [],
              offset: 0,
              period_multiple: 1,
              period_type: "days",
              spend_limits: [
                {
                  amount: "10000000",
                  current_balance: "0",
                  denom:
                    "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4",
                  limit_remaining: "10000000",
                },
              ],
            },
          },
        },
        funds: [],
      },
    });
  });
});

test("Remove single flex account", async () => {
  const currentGatekeeperConfig = new GatekeeperConfig();
  currentGatekeeperConfig.addFlexAccount({
    type: "flex-account",
    meta: {
      name: "Limited Flex Account",
      icon: "",
    },
    address,
    publicKey: {
      type: "tendermint/PubKeySecp256k1",
      value: publicKey,
    },
    privateKey: privateKey,
    spendLimit: {
      period: {
        days: 1,
      },
      amount: 10,
    },
    autoSign: null,
  });
  const newGatekeeperConfig = new GatekeeperConfig();
  const messages = terra.getUpdateGatekeeperMessages({
    currentGatekeeperConfig,
    newGatekeeperConfig,
    proxyAddress,
    ...gatekeepers,
  });
  expect(messages.length).toEqual(1);
  expect(messages[0].toAmino()).toEqual({
    type: "wasm/MsgExecuteContract",
    value: {
      sender: proxyAddress,
      contract: gatekeepers.spendLimitGatekeeper,
      msg: {
        rm_permissioned_address: {
          doomed_permissioned_address: address,
        },
      },
      funds: [],
    },
  });
});
