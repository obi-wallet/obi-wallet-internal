import {
  Coin,
  Coins,
  Msg,
  MsgBeginRedelegate,
  MsgClearContractAdmin,
  MsgDelegate,
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgMigrateContract,
  MsgSend,
  MsgSetWithdrawAddress,
  MsgUndelegate,
  MsgUpdateContractAdmin,
  MsgWithdrawDelegatorReward,
} from "@terra-money/terra.js";

export function wrapMessages({
  messages,
  sender,
  contract,
}: {
  messages: Msg[];
  sender: string;
  contract: string;
}): MsgExecuteContract[] {
  return messages.map((msg) => {
    return new MsgExecuteContract(sender, contract, {
      execute: { universal_msg: { Legacy: wrapMessage(msg) } },
    });
  });
}

export function wrapMessage(message: Msg) {
  if (message instanceof MsgSend) {
    return {
      bank: {
        send: {
          amount: message.amount.map((coin) => {
            return {
              denom: coin.denom,
              amount: coin.amount.toString(),
            };
          }),
          to_address: message.to_address,
        },
      },
    };
  }

  if (message instanceof MsgDelegate) {
    return {
      staking: {
        delegate: {
          amount: wrapCoin(message.amount),
          validator: message.validator_address,
        },
      },
    };
  }

  if (message instanceof MsgBeginRedelegate) {
    return {
      staking: {
        redelegate: {
          amount: wrapCoin(message.amount),
          src_validator: message.validator_src_address,
          dst_validator: message.validator_dst_address,
        },
      },
    };
  }

  if (message instanceof MsgUndelegate) {
    return {
      staking: {
        undelegate: {
          amount: wrapCoin(message.amount),
          validator: message.validator_address,
        },
      },
    };
  }

  if (message instanceof MsgWithdrawDelegatorReward) {
    return {
      distribution: {
        withdraw_delegator_reward: {
          validator: message.validator_address,
        },
      },
    };
  }

  if (message instanceof MsgSetWithdrawAddress) {
    return {
      distribution: {
        set_withdraw_address: {
          address: message.withdraw_address,
        },
      },
    };
  }

  if (message instanceof MsgExecuteContract) {
    return {
      wasm: {
        execute: {
          contract_addr: message.contract,
          funds: wrapCoins(message.coins),
          msg: message.execute_msg,
        },
      },
    };
  }

  if (message instanceof MsgInstantiateContract) {
    return {
      wasm: {
        instantiate: {
          admin: message.admin,
          code_id: message.code_id,
          funds: wrapCoins(message.init_coins),
          label: message.label,
          msg: message.init_msg,
        },
      },
    };
  }

  if (message instanceof MsgMigrateContract) {
    return {
      wasm: {
        migrate: {
          contract_addr: message.contract,
          msg: message.migrate_msg,
          new_code_id: message.new_code_id,
        },
      },
    };
  }

  if (message instanceof MsgUpdateContractAdmin) {
    return {
      wasm: {
        update_admin: {
          admin: message.new_admin,
          contract_addr: message.contract,
        },
      },
    };
  }

  if (message instanceof MsgClearContractAdmin) {
    return {
      wasm: {
        clear_admin: {
          contract_addr: message.contract,
        },
      },
    };
  }

  throw new Error(`Unknown encode object of type ${message.toAmino().type}`);
}

function wrapCoins(coins: Coins) {
  return coins.map(wrapCoin);
}

function wrapCoin(coin: Coin) {
  return {
    denom: coin.denom,
    amount: coin.amount.toString(),
  };
}
