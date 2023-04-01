import { MultisigKey, Sdk } from "@obi-wallet/sdk";
import {
  Coin,
  MsgBeginRedelegate,
  MsgDelegate,
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgSend,
  MsgUndelegate,
} from "@terra-money/feather.js";

export const address = "terra18aw4eedj4v3253dvj9h5ucx9uedl9ggaayktq4";
export const messageSend = new MsgSend(address, address, { uluna: 1000000 });
export const messageDelegate = new MsgDelegate(
  address,
  "terravaloper1src9wvawtfl6ztxss8zu45zuxnwj4ytpnr30jn",
  new Coin("uluna", 100000000000000)
);
export const messageUndelegate = new MsgUndelegate(
  address,
  "terravaloper1src9wvawtfl6ztxss8zu45zuxnwj4ytpnr30jn",
  new Coin("uluna", 100000000000000)
);
export const messageNewAccount = Sdk.chainId(
  "phoenix-1"
).getCreateWalletMessage(MultisigKey.create("phoenix-1"));

export const instantiateMessage = new MsgInstantiateContract(
  address,
  address,
  1,
  {}
);
export const ExecuteMessage = new MsgExecuteContract(address, address, {});
export const upsertFlex = new MsgExecuteContract(address, address, {
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
});
export const rmFlex = new MsgExecuteContract(address, address, {
  rm_permissioned_address: {
    doomed_permissioned_address: address,
  },
});
export const createSessionKey = new MsgExecuteContract(address, address, {
  create_session_key: {
    address: address,
    admin_permissions: true,
    max_duration: 1679329009,
    use_limit: 999,
  },
});
export const destroySessionKey = new MsgExecuteContract(address, address, {
  destroy_session_key: {
    address: address,
    admin_permissions: true,
    max_duration: 1679329009,
    use_limit: 999,
  },
});
export const upsertBeneficiary = new MsgExecuteContract(address, address, {
  upsert_beneficiary: {
    new_beneficiary: {
      address: "terra18aw4eedj4v3253dvj9h5ucx9uedl9ggaayktq4",
      cooldown: 365,
      inheritance_records: [],
      offset: 0,
      period_multiple: 1,
      period_type: "months",
      spend_limits: [
        {
          amount: "1",
          current_balance: "0",
          limit_remaining: "0",
          denom: "PERCENT",
        },
      ],
    },
  },
});
export const upsertBeneficiaryAnnually = new MsgExecuteContract(
  address,
  address,
  {
    upsert_beneficiary: {
      new_beneficiary: {
        address: "terra18aw4eedj4v3253dvj9h5ucx9uedl9ggaayktq4",
        cooldown: 365,
        inheritance_records: [],
        offset: 0,
        period_multiple: 12,
        period_type: "months",
        spend_limits: [
          {
            amount: "10",
            current_balance: "0",
            limit_remaining: "0",
            denom: "PERCENT",
          },
        ],
      },
    },
  }
);

export const unknownMessage = new MsgBeginRedelegate(
  address,
  address,
  address,
  Coin.fromAmino({ amount: "1", denom: "uluna" })
);
export const initMessage = new MsgInstantiateContract(address, address, 1, {});
