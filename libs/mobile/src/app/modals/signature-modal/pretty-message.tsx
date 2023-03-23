import {
  AminoMsgExecuteContract,
  AminoMsgInstantiateContract,
} from "@cosmjs/cosmwasm-stargate/build/modules";
import { AminoMsgSend } from "@cosmjs/stargate";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons/faPaperPlane";
import { faPlay } from "@fortawesome/free-solid-svg-icons/faPlay";
import { faWallet } from "@fortawesome/free-solid-svg-icons/faWallet";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { Text } from "@obi-wallet/common";
import { Coin, cosmosChains, isCosmosChain } from "@obi-wallet/sdk";
import {
  Msg,
  MsgDelegate,
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgSend,
  MsgUndelegate,
  MsgWithdrawDelegatorReward,
} from "@terra-money/feather.js";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useIntl } from "react-intl";
import { View } from "react-native";

import ArrowUpIcon from "./assets/arrowUpIcon.svg";
import { formatCoin, useRewards, useValidators } from "../../balances";
import { CoinIcon } from "../../screens/components/coin-icon";
import { useStore } from "../../stores";

export interface PrettyMessageProps {
  message: Msg.Amino;
}

export const PrettyMessage = observer(function PrettyMessage({
  message,
}: PrettyMessageProps) {
  return (
    <ErrorBoundary FallbackComponent={PrettyMessageUnknown}>
      <PrettyMessageUnsafe message={message} />
    </ErrorBoundary>
  );
});

const PrettyMessageUnsafe = observer(function PrettyMessageUnsafe({
  message,
}: PrettyMessageProps) {
  switch (message.type) {
    case "bank/MsgSend":
    case "cosmos-sdk/MsgSend": {
      const msg = message as MsgSend.Amino;
      return <PrettyMessageSend {...msg} />;
    }
    case "wasm/MsgInstantiateContract": {
      const msg = message as MsgInstantiateContract.Amino;
      return <PrettyMessageInstantiateContract {...msg} />;
    }
    case "wasm/MsgExecuteContract": {
      const msg = message as MsgExecuteContract.Amino;
      return <PrettyMessageExecuteContract {...msg} />;
    }
    case "cosmos-sdk/MsgDelegate": {
      const msg = message as MsgDelegate.Amino;
      return <PrettyMessageStaking {...msg} label="Staking to:" />;
    }
    case "cosmos-sdk/MsgUndelegate": {
      const msg = message as MsgUndelegate.Amino;
      return <PrettyMessageStaking {...msg} label="Unstaking from:" />;
    }
    case "distribution/MsgWithdrawDelegationReward":
    case "cosmos-sdk/MsgWithdrawDelegationReward": {
      const msg = message as MsgWithdrawDelegatorReward.Amino;
      return <PrettyMessageWithdrawDelegatorReward {...msg} />;
    }
    default:
      return <PrettyMessageUnknown />;
  }
});
const PrettyMessageStaking = observer<
  (MsgDelegate.Amino | MsgUndelegate.Amino) & { label: string }
>(function PrettyMessageStaking({ value, label }) {
  const validators = useValidators();
  const validator = validators.data?.find(
    (val) => val.address === value.validator_address
  );

  return (
    <MessageElement coins={[value.amount]} icon={<ArrowUpIcon />} title={label}>
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
      const validators = useValidators();
      const rewards = useRewards();
      const validator = validators.data?.find(
        (validator) => validator.address === value.validator_address
      );
      const reward = rewards.data?.perDelegator.find(
        (delegator) => delegator.address === value.validator_address
      );

      return (
        <MessageElement
          icon={<ArrowUpIcon />}
          title="Withdrawing staking rewards from:"
          coins={reward?.rewards ? [reward.rewards] : undefined}
        >
          <Text style={{ color: "white" }}>
            {validator?.label ||
              Bech32Address.shortenAddress(value.validator_address, 35)}
          </Text>
        </MessageElement>
      );
    }
  );

const PrettyMessageSend = observer(function PrettyMessageSend({
  value,
}: AminoMsgSend | MsgSend.Amino) {
  const { configStore } = useStore();
  const isObi = configStore.isObi();

  return (
    <MessageElement
      icon={<FontAwesomeIcon icon={faPaperPlane} size={33} color="white" />}
      title={isObi ? "To:" : "Send"}
      coins={[...value.amount]}
    >
      {isObi ? (
        <Text style={{ color: "white" }}>
          {Bech32Address.shortenAddress(value.to_address, 35)}
        </Text>
      ) : (
        <>
          <Text style={{ color: "white" }}>
            {Bech32Address.shortenAddress(value.to_address, 20)}
            <Text style={{ opacity: 0.6 }}> will receive:</Text>
          </Text>
          {value.amount.map((coin) => {
            const { amount, denom } = formatCoin(coin);
            return (
              <Text style={{ color: "white" }} key={denom}>
                {amount} {denom}
              </Text>
            );
          })}
        </>
      )}
    </MessageElement>
  );
});

const PrettyMessageInstantiateContract = observer(
  function PrettyMessageInstantiateContract({
    value,
  }: AminoMsgInstantiateContract | MsgInstantiateContract.Amino) {
    const { chainStore } = useStore();
    const intl = useIntl();

    if (
      isCosmosChain(chainStore.currentChain) &&
      value.code_id ===
        cosmosChains[chainStore.currentChain].currentCodeId.toString()
    ) {
      return (
        <MessageElement
          icon={<FontAwesomeIcon icon={faWallet} size={33} color="white" />}
          title={intl.formatMessage({
            id: "signature.modal.createobiwallet",
            defaultMessage: "Create Obi Wallet",
          })}
        />
      );
    }

    return (
      <MessageElement
        icon={<ArrowUpIcon />}
        title={intl.formatMessage({
          id: "signature.modal.initcontract",
          defaultMessage: "Init Contract",
        })}
      />
    );
  }
);

const PrettyMessageExecuteContract = observer(
  function PrettyMessageExecuteContract({
    value,
  }: AminoMsgExecuteContract | MsgExecuteContract.Amino) {
    const intl = useIntl();
    const message = getMessage();
    const funds = getFunds();
    const { configStore } = useStore();
    const isLoop = configStore.isLoop();
    const isObi = configStore.isObi();

    if (typeof message === "object" && R.has("propose_update_owner", message)) {
      return (
        <MessageElement
          icon={<ArrowUpIcon />}
          title="Update Multikey (step 1 of 2)"
          coins={[...funds]}
        />
      );
    }

    if (typeof message === "object" && R.has("confirm_update_owner", message)) {
      return (
        <MessageElement
          icon={<ArrowUpIcon />}
          title="Confirm Update (step 2 of 2)"
          coins={[...funds]}
        />
      );
    }

    if (typeof message === "object" && R.has("propose_update_admin", message)) {
      return (
        <MessageElement
          icon={<ArrowUpIcon />}
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
          icon={<ArrowUpIcon />}
          title={intl.formatMessage({
            id: "signature.modal.confirmupdateadmin",
            defaultMessage: "Confirm Update (step 2 of 2)",
          })}
          coins={[...funds]}
        />
      );
    }

    if (typeof message === "object" && R.has("new_account", message)) {
      return (
        <MessageElement
          coins={[...funds]}
          icon={<ArrowUpIcon />}
          title="Create Obi Wallet"
        />
      );
    }

    if (typeof message === "object" && R.has("wrapped_migrate", message)) {
      return (
        <MessageElement
          coins={[...funds]}
          icon={<ArrowUpIcon />}
          title="Update Obi Wallet"
        />
      );
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
          icon={<ArrowUpIcon />}
          title="Add/Update Permissioned Address"
        >
          <Text style={{ color: "white" }}>
            {Bech32Address.shortenAddress(
              msg.upsert_permissioned_address.new_permissioned_address.address,
              35
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
        <MessageElement
          coins={[...funds]}
          icon={<ArrowUpIcon />}
          title="Remove Permissioned Address"
        >
          <Text style={{ color: "white" }}>
            {Bech32Address.shortenAddress(
              msg.rm_permissioned_address?.doomed_permissioned_address,
              35
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
        <MessageElement
          coins={[...funds]}
          icon={<ArrowUpIcon />}
          title="Create Session Key"
        >
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
        <MessageElement
          coins={[...funds]}
          icon={<ArrowUpIcon />}
          title="Destroy Session Key"
        >
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
              }
            ];
          };
        };
      };
      // cooldown (days) to months
      const cooldown = msg.upsert_beneficiary.new_beneficiary.cooldown / 30;
      const percent =
        msg.upsert_beneficiary.new_beneficiary.spend_limits[0].amount;
      // if period_multiple is 1, then it's a monthly payment else it's a annually payment
      const period =
        msg.upsert_beneficiary.new_beneficiary.period_multiple === 1
          ? "monthly"
          : "annually";

      return (
        <MessageElement
          coins={[...funds]}
          icon={<ArrowUpIcon />}
          title="Add/Update Beneficiary"
        >
          <View
            style={{
              flex: 1,
              width: "100%",
              alignItems: isObi ? "center" : "flex-start",
            }}
          >
            <Text style={{ color: "white" }}>
              {Bech32Address.shortenAddress(
                msg.upsert_beneficiary.new_beneficiary.address,
                35
              )}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.6)" }}>
              will receive{" "}
              <Text style={{ color: "white" }}>
                {percent}% {period}
              </Text>{" "}
              after{" "}
              <Text style={{ color: "white" }}>{Math.round(cooldown)}</Text>{" "}
              months of inactivity
            </Text>
          </View>
        </MessageElement>
      );
    }
    return (
      <MessageElement
        icon={<FontAwesomeIcon icon={faPlay} size={33} color="white" />}
        title="Execute Wasm Contract"
        coins={funds}
      >
        <View
          style={{
            flex: 1,
            width: "100%",
            alignItems: isObi ? "center" : "flex-start",
          }}
        >
          <Text style={{ fontWeight: "700", color: "#fff" }}>
            {Bech32Address.shortenAddress(value.contract, 35)}
          </Text>
          {isLoop ? (
            <View>
              {funds.length > 0 && (
                <View>
                  <Text style={{ color: "#fff" }}>by sending: </Text>
                </View>
              )}
              {funds.map((token) => {
                const { amount, denom } = formatCoin(token);
                return (
                  <Text
                    style={{ color: "white" }}
                    key={denom ? denom : token.denom}
                  >
                    {amount ? amount : token.amount}{" "}
                    {denom ? denom : token.denom}
                  </Text>
                );
              })}
            </View>
          ) : null}
          <Text style={{ color: "white" }}>
            Check the data tab for the full message
          </Text>
        </View>
      </MessageElement>
    );

    function getMessage(): unknown {
      return isAminoV1Value(value) ? value.execute_msg : value.msg;
    }

    function getFunds(): readonly Coin[] {
      return isAminoV1Value(value) ? value.coins : value.funds;
    }

    function isAminoV1Value(
      value: (AminoMsgExecuteContract | MsgExecuteContract.Amino)["value"]
    ): value is MsgExecuteContract.AminoV1["value"] {
      return (
        typeof (value as MsgExecuteContract.AminoV1["value"]).execute_msg !==
        "undefined"
      );
    }
  }
);

const PrettyMessageUnknown = observer(function PrettyMessageUnknown() {
  const intl = useIntl();
  return (
    <MessageElement
      icon={<ArrowUpIcon />}
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
  icon?: ReactNode;
  title?: string;
  subTitle?: string;
  children?: ReactNode;
  coins?: PrettyCoinsProps["coins"];
}

const MessageElement = observer<MessageElementProps>(function MessageElement({
  icon,
  title,
  subTitle,
  children,
  coins,
}) {
  const { configStore } = useStore();
  const isLoop = configStore.isLoop();

  return isLoop ? (
    <View
      style={{
        minHeight: 50,
        flexDirection: "row",
        borderBottomColor: "rgba(255,255,255, 0.6)",
        borderBottomWidth: 1,
        paddingVertical: 15,
        paddingHorizontal: 10,
      }}
    >
      <View style={{ justifyContent: "flex-start", alignItems: "center" }}>
        {icon}
      </View>
      <View
        style={{ flex: 1, justifyContent: "space-around", paddingLeft: 10 }}
      >
        <Text
          style={{
            color: "white",
            fontWeight: "600",
            fontSize: 16,
            marginBottom: 10,
          }}
        >
          {title ? title : ""}
        </Text>
        {subTitle ? (
          <Text style={{ color: "white", opacity: 0.6 }}>{subTitle}</Text>
        ) : null}
        {children}
      </View>
    </View>
  ) : (
    <View>
      <View
        style={{
          alignItems: "center",
          paddingVertical: 20,
          borderColor: "#2C2C2C",
          borderTopWidth: 1,
        }}
      >
        <PrettyCoins coins={coins} />
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

interface PrettyCoinsProps {
  coins?: readonly Coin[];
}

const PrettyCoins = observer<PrettyCoinsProps>(function PrettyCoins({ coins }) {
  const { chainStore } = useStore();
  const denom = chainStore.currentChainInformation.denom;
  const coinsArray =
    coins && coins.length > 0 ? coins : [{ amount: "0", denom: denom }];
  return (
    <View>
      {coinsArray.map((coin) => {
        const { amount, denom, icon } = formatCoin(coin);
        return (
          <View
            key={denom}
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View style={{ width: 36, height: 36, marginRight: 10 }}>
              <CoinIcon source={icon ? icon : null} />
            </View>
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
