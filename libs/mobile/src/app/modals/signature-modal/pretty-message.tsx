import { AminoMsg } from "@cosmjs/amino";
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
import {
  Msg,
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgSend,
} from "@terra-money/terra.js";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import React, { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useIntl } from "react-intl";
import { View } from "react-native";

import { formatCoin } from "../../balances";
import { useStore } from "../../stores";
import ArrowUpIcon from "./assets/arrowUpIcon.svg";

export interface PrettyMessageProps {
  message: AminoMsg | Msg.Amino;
}

export function PrettyMessage({ message }: PrettyMessageProps) {
  return (
    <ErrorBoundary FallbackComponent={PrettyMessageUnknown}>
      <PrettyMessageUnsafe message={message} />
    </ErrorBoundary>
  );
}

function PrettyMessageUnsafe({ message }: PrettyMessageProps) {
  switch (message.type) {
    case "bank/MsgSend":
    case "cosmos-sdk/MsgSend": {
      const msg = message as AminoMsgSend | MsgSend.Amino;
      return <PrettyMessageSend {...msg} />;
    }
    case "wasm/MsgInstantiateContract": {
      const msg = message as
        | AminoMsgInstantiateContract
        | MsgInstantiateContract.Amino;
      return <PrettyMessageInstantiateContract {...msg} />;
    }
    case "wasm/MsgExecuteContract": {
      const msg = message as AminoMsgExecuteContract | MsgExecuteContract.Amino;
      return <PrettyMessageExecuteContract {...msg} />;
    }
    default:
      return <PrettyMessageUnknown />;
  }
}

function PrettyMessageSend({ value }: AminoMsgSend | MsgSend.Amino) {
  return (
    <MessageElement
      icon={<FontAwesomeIcon icon={faPaperPlane} size={33} color="white" />}
      title="Send"
    >
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
    </MessageElement>
  );
}

const PrettyMessageInstantiateContract = observer(
  ({ value }: AminoMsgInstantiateContract | MsgInstantiateContract.Amino) => {
    const { chainStore } = useStore();
    const intl = useIntl();

    if (
      value.code_id ===
      chainStore.currentCosmosChainInformation.currentCodeId.toString()
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
  ({ value }: AminoMsgExecuteContract | MsgExecuteContract.Amino) => {
    const intl = useIntl();
    const message = getMessage();
    const funds = getFunds();

    if (typeof message === "object" && R.has("propose_update_admin", message)) {
      return (
        <MessageElement
          icon={<ArrowUpIcon />}
          title={intl.formatMessage({
            id: "signature.modal.proposeupdateadmin",
            defaultMessage: "Propose new admin for Obi Wallet",
          })}
        />
      );
    }

    if (typeof message === "object" && R.has("confirm_update_admin", message)) {
      return (
        <MessageElement
          icon={<ArrowUpIcon />}
          title={intl.formatMessage({
            id: "signature.modal.confirmupdateadmin",
            defaultMessage: "Confirm new admin for Obi Wallet",
          })}
        />
      );
    }

    return (
      <MessageElement
        icon={<FontAwesomeIcon icon={faPlay} size={33} color="white" />}
        title="Execute Wasm Contract"
      >
        <Text style={{ color: "white" }}>
          Execute wasm contract{" "}
          <Text style={{ fontWeight: "700" }}>
            {Bech32Address.shortenAddress(value.contract, 20)}
          </Text>
        </Text>
        <Text style={{ color: "white" }}>
          {funds.length > 0 && "by sending:"}
          {funds.map((token) => {
            const { amount, denom } = formatCoin(token);
            return (
              <Text
                style={{ color: "white" }}
                key={denom ? denom : token.denom}
              >
                {amount ? amount : token.amount} {denom ? denom : token.denom}
              </Text>
            );
          })}
        </Text>
        <Text style={{ color: "white" }}>
          {JSON.stringify(message, null, 2)}
        </Text>
      </MessageElement>
    );

    function getMessage(): unknown {
      return isAminoV1Value(value) ? value.execute_msg : value.msg;
    }

    function getFunds() {
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

function PrettyMessageUnknown() {
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
}

interface MessageElementProps {
  icon: ReactNode;
  title?: string;
  subTitle?: string;
  children?: ReactNode;
}

function MessageElement({
  icon,
  title,
  subTitle,
  children,
}: MessageElementProps) {
  return (
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
  );
}
