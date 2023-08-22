import {
  AminoMsgExecuteContract,
  AminoMsgInstantiateContract,
} from "@cosmjs/cosmwasm-stargate/build/modules";
import { AminoMsgSend } from "@cosmjs/stargate";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useQuery, useValidators } from "@obi-wallet/headless-ui";
import {
  ChainId,
  isLegacyCosmosChain,
  legacyCosmosChains,
  MessageJson,
  Sdk,
  Token,
} from "@obi-wallet/sdk";
import {
  MsgDelegate,
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgSend,
  MsgUndelegate,
  MsgWithdrawDelegatorReward,
} from "@terra-money/feather.js";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { createContext, ReactNode, useContext } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useIntl } from "react-intl";
import { View } from "react-native";
import invariant from "tiny-invariant";

import { useStore } from "../../../contexts";
import { enrichToken } from "../../../hooks";
import { CoinIcon } from "../../icons";
import { Text } from "../../typography";

const ChainIdContext = createContext<ChainId | null>(null);

function useChainId() {
  const chainId = useContext(ChainIdContext);
  invariant(chainId, "Chain ID must be provided");
  return chainId;
}

export interface PrettyMessageProps {
  message: MessageJson;
  chainId: ChainId;
}

export const PrettyMessage = observer<PrettyMessageProps>(
  function PrettyMessage({ message, chainId }) {
    return (
      <ChainIdContext.Provider value={chainId}>
        <ErrorBoundary FallbackComponent={PrettyMessageUnknown}>
          <PrettyMessageUnsafe message={message} />
        </ErrorBoundary>
      </ChainIdContext.Provider>
    );
  },
);

const PrettyMessageUnsafe = observer<Omit<PrettyMessageProps, "chainId">>(
  function PrettyMessageUnsafe({ message }) {
    const type = R.has("type", message) ? message.type : null;

    switch (type) {
      case "bank/MsgSend":
      case "cosmos-sdk/MsgSend": {
        const msg = message as unknown as MsgSend.Amino;
        return <PrettyMessageSend {...msg} />;
      }
      case "wasm/MsgInstantiateContract": {
        const msg = message as unknown as MsgInstantiateContract.Amino;
        return <PrettyMessageInstantiateContract {...msg} />;
      }
      case "wasm/MsgExecuteContract": {
        const msg = message as unknown as MsgExecuteContract.Amino;
        return <PrettyMessageExecuteContract {...msg} />;
      }
      case "cosmos-sdk/MsgDelegate": {
        const msg = message as unknown as MsgDelegate.Amino;
        return <PrettyMessageStaking {...msg} label="Staking to:" />;
      }
      case "cosmos-sdk/MsgUndelegate": {
        const msg = message as unknown as MsgUndelegate.Amino;
        return <PrettyMessageStaking {...msg} label="Unstaking from:" />;
      }
      case "distribution/MsgWithdrawDelegationReward":
      case "cosmos-sdk/MsgWithdrawDelegationReward": {
        const msg = message as unknown as MsgWithdrawDelegatorReward.Amino;
        return <PrettyMessageWithdrawDelegatorReward {...msg} />;
      }
      default:
        return <PrettyMessageUnknown />;
    }
  },
);
const PrettyMessageStaking = observer<
  (MsgDelegate.Amino | MsgUndelegate.Amino) & { label: string }
>(function PrettyMessageStaking({ value, label }) {
  const chainId = useChainId();
  const validators = useValidators(chainId);
  const validator = validators.data?.find(
    (val) => val.address === value.validator_address,
  );

  return (
    <MessageElement
      coins={[
        {
          id: value.amount.denom,
          rawAmount: value.amount.amount,
        },
      ]}
      title={label}
    >
      <Text style={{ color: "white" }}>
        {validator?.label ||
          Bech32Address.shortenAddress(value.validator_address, 35)}
      </Text>
    </MessageElement>
  );
});

const PrettyMessageWithdrawDelegatorReward =
  observer<MsgWithdrawDelegatorReward.Amino>(
    function PrettyMessageWithdrawDelegatorReward({ value }) {
      const chainId = useChainId();
      const validators = useValidators(chainId);
      const { chainStore } = useStore();

      const rewards = useQuery(
        Sdk.chainId(chainStore.currentChain).staking.rewardsQuery(
          value.delegator_address,
        ),
      );
      const validator = validators.data?.find(
        (validator) => validator.address === value.validator_address,
      );
      const reward = rewards.data?.perDelegator.find(
        (delegator) => delegator.address === value.validator_address,
      );

      return (
        <MessageElement
          title="Withdrawing staking rewards from:"
          coins={reward?.rewards ? [reward.rewards] : undefined}
        >
          <Text style={{ color: "white" }}>
            {validator?.label ||
              Bech32Address.shortenAddress(value.validator_address, 35)}
          </Text>
        </MessageElement>
      );
    },
  );

const PrettyMessageSend = observer<AminoMsgSend | MsgSend.Amino>(
  function PrettyMessageSend({ value }) {
    const tokens = value.amount.map((coin) => {
      return {
        id: coin.denom,
        rawAmount: coin.amount,
      };
    });

    return (
      <MessageElement title="To:" coins={tokens}>
        <Text style={{ color: "white" }}>
          {Bech32Address.shortenAddress(value.to_address, 35)}
        </Text>
      </MessageElement>
    );
  },
);

const PrettyMessageInstantiateContract = observer<
  AminoMsgInstantiateContract | MsgInstantiateContract.Amino
>(function PrettyMessageInstantiateContract({ value }) {
  const { chainStore } = useStore();
  const intl = useIntl();

  if (
    isLegacyCosmosChain(chainStore.currentChain) &&
    value.code_id ===
      legacyCosmosChains[chainStore.currentChain].currentCodeId.toString()
  ) {
    return (
      <MessageElement
        title={intl.formatMessage({
          id: "signature.modal.createobiwallet",
          defaultMessage: "Create Obi Wallet",
        })}
      />
    );
  }

  return (
    <MessageElement
      title={intl.formatMessage({
        id: "signature.modal.initcontract",
        defaultMessage: "Init Contract",
      })}
    />
  );
});

const PrettyMessageExecuteContract = observer<
  AminoMsgExecuteContract | MsgExecuteContract.Amino
>(function PrettyMessageExecuteContract({ value }) {
  const intl = useIntl();
  const message = getMessage();
  const funds = getFunds();
  if (typeof message === "object" && R.has("propose_update_owner", message)) {
    return (
      <MessageElement
        title="Update Multikey (step 1 of 2)"
        coins={[...funds]}
      />
    );
  }

  if (typeof message === "object" && R.has("confirm_update_owner", message)) {
    return (
      <MessageElement title="Confirm Update (step 2 of 2)" coins={[...funds]} />
    );
  }

  if (typeof message === "object" && R.has("propose_update_admin", message)) {
    return (
      <MessageElement
        title={intl.formatMessage({
          id: "signature.modal.proposeupdateadmin",
          defaultMessage: "Update Multikey (step 1 of 2)",
        })}
        coins={[...funds]}
      />
    );
  }

  if (typeof message === "object" && R.has("confirm_update_admin", message)) {
    return (
      <MessageElement
        title={intl.formatMessage({
          id: "signature.modal.confirmupdateadmin",
          defaultMessage: "Confirm Update (step 2 of 2)",
        })}
        coins={[...funds]}
      />
    );
  }

  if (typeof message === "object" && R.has("new_account", message)) {
    return <MessageElement coins={[...funds]} title="Create Obi Wallet" />;
  }

  if (typeof message === "object" && R.has("wrapped_migrate", message)) {
    return <MessageElement coins={[...funds]} title="Update Obi Wallet" />;
  }
  if (
    typeof message === "object" &&
    R.has("upsert_permissioned_address", message)
  ) {
    const msg = message as {
      upsert_permissioned_address: {
        new_permissioned_address: {
          address: string;
        };
      };
    };
    return (
      <MessageElement
        coins={[...funds]}
        title="Add/Update Permissioned Address"
      >
        <Text style={{ color: "white" }}>
          {Bech32Address.shortenAddress(
            msg.upsert_permissioned_address.new_permissioned_address.address,
            35,
          )}
        </Text>
      </MessageElement>
    );
  }
  if (
    typeof message === "object" &&
    R.has("rm_permissioned_address", message)
  ) {
    const msg = message as {
      rm_permissioned_address: {
        doomed_permissioned_address: string;
      };
    };
    return (
      <MessageElement coins={[...funds]} title="Remove Permissioned Address">
        <Text style={{ color: "white" }}>
          {Bech32Address.shortenAddress(
            msg.rm_permissioned_address?.doomed_permissioned_address,
            35,
          )}
        </Text>
      </MessageElement>
    );
  }
  if (typeof message === "object" && R.has("create_session_key", message)) {
    const msg = message as {
      create_session_key: {
        address: string;
      };
    };
    return (
      <MessageElement coins={[...funds]} title="Create Session Key">
        <Text style={{ color: "white" }}>
          {Bech32Address.shortenAddress(msg.create_session_key.address, 35)}
        </Text>
      </MessageElement>
    );
  }
  if (typeof message === "object" && R.has("destroy_session_key", message)) {
    const msg = message as {
      destroy_session_key: {
        address: string;
      };
    };
    return (
      <MessageElement coins={[...funds]} title="Destroy Session Key">
        <Text style={{ color: "white" }}>
          {Bech32Address.shortenAddress(msg.destroy_session_key.address, 35)}
        </Text>
      </MessageElement>
    );
  }
  if (typeof message === "object" && R.has("upsert_beneficiary", message)) {
    const msg = message as {
      upsert_beneficiary: {
        new_beneficiary: {
          address: string;
          cooldown: number;
          period_multiple: number;
          spend_limits: [
            {
              amount: string;
            },
          ];
        };
      };
    };
    // cooldown (days) to months
    const cooldown = msg.upsert_beneficiary.new_beneficiary.cooldown / 30;
    const percent =
      msg.upsert_beneficiary.new_beneficiary.spend_limits[0].amount;
    // if period_multiple is 1, then it's a monthly payment else it's an annual payment
    const period =
      msg.upsert_beneficiary.new_beneficiary.period_multiple === 1
        ? "monthly"
        : "annually";

    return (
      <MessageElement coins={[...funds]} title="Add/Update Beneficiary">
        <View
          style={{
            flex: 1,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white" }}>
            {Bech32Address.shortenAddress(
              msg.upsert_beneficiary.new_beneficiary.address,
              35,
            )}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.6)" }}>
            will receive{" "}
            <Text style={{ color: "white" }}>
              {percent}% {period}
            </Text>{" "}
            after <Text style={{ color: "white" }}>{Math.round(cooldown)}</Text>{" "}
            months of inactivity
          </Text>
        </View>
      </MessageElement>
    );
  }
  return (
    <MessageElement title="Execute Wasm Contract" coins={funds}>
      <View
        style={{
          flex: 1,
          width: "100%",
          alignItems: "center",
        }}
      >
        <Text style={{ fontWeight: "700", color: "#fff" }}>
          {Bech32Address.shortenAddress(value.contract, 35)}
        </Text>
        <Text style={{ color: "white" }}>
          Check the data tab for the full message
        </Text>
      </View>
    </MessageElement>
  );

  function getMessage(): unknown {
    return isAminoV1Value(value) ? value.execute_msg : value.msg;
  }

  function getFunds(): readonly Token[] {
    return isAminoV1Value(value)
      ? value.coins.map((coin) => {
          return {
            id: coin.denom,
            rawAmount: coin.amount,
          };
        })
      : value.funds.map((coin) => {
          return {
            id: coin.denom,
            rawAmount: coin.amount,
          };
        });
  }

  function isAminoV1Value(
    value: (AminoMsgExecuteContract | MsgExecuteContract.Amino)["value"],
  ): value is MsgExecuteContract.AminoV1["value"] {
    return (
      typeof (value as MsgExecuteContract.AminoV1["value"]).execute_msg !==
      "undefined"
    );
  }
});

const PrettyMessageUnknown = observer(function PrettyMessageUnknown() {
  const intl = useIntl();
  return (
    <MessageElement
      title={intl.formatMessage({
        id: "signature.modal.unknownmessage.heading",
        defaultMessage: "Unknown message",
      })}
      subTitle={intl.formatMessage({
        id: "signature.modal.unknownmessage.subheading",
        defaultMessage: "Please check data tab",
      })}
    />
  );
});

interface MessageElementProps {
  title?: string;
  subTitle?: string;
  children?: ReactNode;
  coins?: PrettyTokensProps["tokens"];
}

const MessageElement = observer<MessageElementProps>(function MessageElement({
  title,
  subTitle,
  children,
  coins,
}) {
  return (
    <View>
      <View
        style={{
          alignItems: "center",
          paddingVertical: 20,
          borderColor: "#2C2C2C",
          borderTopWidth: 1,
        }}
      >
        <PrettyCoins tokens={coins} />
      </View>
      <View
        style={{
          alignItems: "center",
          borderColor: "#2C2C2C",
          borderTopWidth: 1,
          borderBottomWidth: 1,
          paddingVertical: 20,
        }}
      >
        <Text style={{ color: "white", opacity: 0.6 }}>
          {title ? title : ""}
        </Text>
        {subTitle ? (
          <Text style={{ opacity: 0.6, color: "white" }}>{subTitle}</Text>
        ) : null}
        {children}
      </View>
    </View>
  );
});

interface PrettyTokensProps {
  tokens?: readonly Token[];
}

const PrettyCoins = observer<PrettyTokensProps>(function PrettyTokens({
  tokens,
}) {
  const chainId = useChainId();
  const { chainStore, configStore } = useStore();
  const denom = configStore.config.ethereumBalances
    ? "0x5CF29823CCFC73008fa53630d54A424AB82dE6F2"
    : chainStore.currentChainInformation.denom;
  const coinsArray =
    tokens && tokens.length > 0 ? tokens : [{ id: denom, rawAmount: "0" }];
  return (
    <View>
      {coinsArray.map((token) => {
        const { amount } = enrichToken({
          chainId,
          token,
        });
        const denom = "ETH"
        const icon = null
        return (
          <View
            key={denom}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {icon && (
              <View style={{ width: 36, height: 36, marginRight: 10 }}>
                <CoinIcon source={icon} />
              </View>
            )}
            <Text style={{ color: "white", fontSize: 49 }} key={denom}>
              {amount}
              <Text style={{ fontSize: 16 }}>{denom}</Text>
            </Text>
          </View>
        );
      })}
    </View>
  );
});
