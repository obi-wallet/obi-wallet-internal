import {
  generateSec256k1KeyPair,
  ObservableGatekeeperConfig,
  Sdk,
} from "@obi-wallet/sdk";
import { DateTime } from "luxon";
import invariant from "tiny-invariant";

import { getUpdateGatekeeperMessages } from "../../../src/networks/terra/messages";

const proxyAddress =
  "terra19g840q54mxd5vyxh3rdfpncmmyql5hcu8j9wcg45zgwgt4phwdes27emev";
const { publicKey, privateKey } = generateSec256k1KeyPair();
const address = Sdk.chainId("phoenix-1").getAddressOfPublicKey({
  publicKey,
});
let gatekeepers: {
  spendLimitGatekeeper: string;
  sessionKeyGatekeeper: string;
};

beforeAll(async () => {
  const response = await Sdk.chainId(
    "phoenix-1"
  ).fetchGatekeeperContractAddresses({
    proxyAddress,
  });
  invariant(response.spendLimitGatekeeper, "Spend limit gatekeeper not found");
  invariant(response.sessionKeyGatekeeper, "Session key gatekeeper not found");
  gatekeepers = {
    spendLimitGatekeeper: response.spendLimitGatekeeper,
    sessionKeyGatekeeper: response.sessionKeyGatekeeper,
  };
});

describe("Empty gatekeeper config", () => {
  const currentGatekeeperConfig = ObservableGatekeeperConfig.empty();

  test("No changes", () => {
    const newGatekeeperConfig = ObservableGatekeeperConfig.empty();
    const messages = getUpdateGatekeeperMessages({
      currentGatekeeperConfig,
      newGatekeeperConfig,
      proxyAddress,
      ...gatekeepers,
    });
    expect(messages).toEqual([]);
  });

  test("Add beneficiary", () => {
    const newGatekeeperConfig = ObservableGatekeeperConfig.empty();
    newGatekeeperConfig.upsertBeneficiary({
      type: "beneficiary",
      meta: {
        name: "Beneficiary",
        icon: "",
      },
      address,
      dormancyThreshold: {
        years: 1,
      },
      dripSchedule: {
        rate: 0.05,
        period: {
          years: 1,
        },
      },
    });
    const messages = getUpdateGatekeeperMessages({
      currentGatekeeperConfig,
      newGatekeeperConfig,
      proxyAddress,
      ...gatekeepers,
    });
    expect(messages.length).toEqual(1);
    expect(messages[0].toAmino()).toEqual({
      type: "wasm/MsgExecuteContract",
      value: {
        contract:
          "terra15jvhucnncqrut6t83zf7f7yx8syzxg6rpa643nw99h9n4cmuk6tqsaq7lt",
        funds: [],
        msg: {
          upsert_beneficiary: {
            new_beneficiary: {
              address,
              cooldown: 365,
              inheritance_records: [],
              offset: 0,
              period_multiple: 12,
              period_type: "months",
              spend_limits: [
                {
                  amount: "5",
                  current_balance: "0",
                  denom: "PERCENT",
                  limit_remaining: "0",
                },
              ],
            },
          },
        },
        sender:
          "terra19g840q54mxd5vyxh3rdfpncmmyql5hcu8j9wcg45zgwgt4phwdes27emev",
      },
    });
  });

  test("Add strict flex account", () => {
    const newGatekeeperConfig = ObservableGatekeeperConfig.empty();
    newGatekeeperConfig.upsertFlexAccount({
      type: "flex-account",
      meta: {
        name: "Strict Flex Account",
        icon: "",
      },
      address,
      publicKey,
      privateKey: privateKey,
      spendLimit: null,
      autoSign: null,
    });
    const messages = getUpdateGatekeeperMessages({
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
    const newGatekeeperConfig = ObservableGatekeeperConfig.empty();
    newGatekeeperConfig.upsertFlexAccount({
      type: "flex-account",
      meta: {
        name: "Limited Flex Account",
        icon: "",
      },
      address,
      publicKey,
      privateKey: privateKey,
      spendLimit: {
        period: {
          days: 1,
        },
        amount: 10,
      },
      autoSign: null,
    });
    const messages = getUpdateGatekeeperMessages({
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
    const newGatekeeperConfig = ObservableGatekeeperConfig.empty();
    newGatekeeperConfig.upsertFlexAccount({
      type: "flex-account",
      meta: {
        name: "Unlocked Flex Account",
        icon: "",
      },
      address,
      publicKey,
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
    const messages = getUpdateGatekeeperMessages({
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
  const currentGatekeeperConfig = ObservableGatekeeperConfig.empty();
  currentGatekeeperConfig.upsertFlexAccount({
    type: "flex-account",
    meta: {
      name: "Limited Flex Account",
      icon: "",
    },
    address,
    publicKey,
    privateKey: privateKey,
    spendLimit: {
      period: {
        days: 1,
      },
      amount: 10,
    },
    autoSign: null,
  });
  const newGatekeeperConfig = ObservableGatekeeperConfig.empty();
  const messages = getUpdateGatekeeperMessages({
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

test("Make unlocked flex account locked", async () => {
  const flexAccount = {
    type: "flex-account" as const,
    meta: {
      name: "Limited Flex Account",
      icon: "",
    },
    address,
    publicKey,
    privateKey: privateKey,
    spendLimit: {
      period: {
        days: 1,
      },
      amount: 10,
    },
  };

  const currentGatekeeperConfig = ObservableGatekeeperConfig.empty();
  currentGatekeeperConfig.upsertFlexAccount({
    ...flexAccount,
    autoSign: {
      endTime: DateTime.now().plus({ minutes: 30 }).toISO(),
    },
  });
  const newGatekeeperConfig = ObservableGatekeeperConfig.empty();
  newGatekeeperConfig.upsertFlexAccount({
    ...flexAccount,
    autoSign: null,
  });
  const messages = getUpdateGatekeeperMessages({
    currentGatekeeperConfig,
    newGatekeeperConfig,
    proxyAddress,
    ...gatekeepers,
  });
  expect(messages.length).toEqual(1);
  expect(messages[0].toAmino()).toEqual({
    type: "wasm/MsgExecuteContract",
    value: {
      contract:
        "terra1flmkgq2zcqj66ytwss6dp6p8k0sr39856vflh07phnfv6agcpemse6g9c2",
      funds: [],
      msg: {
        destroy_session_key: {
          address,
        },
      },
      sender:
        "terra19g840q54mxd5vyxh3rdfpncmmyql5hcu8j9wcg45zgwgt4phwdes27emev",
    },
  });
});
