import { useTheme } from "@emotion/react";
import { terra } from "@obi-wallet/common";
import {
  Coin,
  MsgBeginRedelegate,
  MsgDelegate,
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgSend,
  MsgUndelegate,
} from "@terra-money/terra.js";
import { ScrollView } from "react-native-gesture-handler";

import { PrettyMessage } from "../src";

const { getNewAccountMessage } = terra;

export default function PrettyMessages() {
  const address = "terra18aw4eedj4v3253dvj9h5ucx9uedl9ggaayktq4";
  const messageSend = new MsgSend(address, address, { uluna: 1000000 });
  const messageDelegate = new MsgDelegate(
    address,
    "terravaloper1src9wvawtfl6ztxss8zu45zuxnwj4ytpnr30jn",
    new Coin("uluna", 100000000000000)
  );
  const messageUndelegate = new MsgUndelegate(
    address,
    "terravaloper1src9wvawtfl6ztxss8zu45zuxnwj4ytpnr30jn",
    new Coin("uluna", 100000000000000)
  );
  const messageNewAccount = getNewAccountMessage({
    address: "terra1234567",
    signers: [{ address, ty: "raw" }],
    chainId: "phoenix-1",
  });
  const instantiateMessage = new MsgInstantiateContract(
    address,
    address,
    1,
    {}
  );
  const ExecuteMessage = new MsgExecuteContract(address, address, {});
  const unknownMessage = new MsgBeginRedelegate(
    address,
    address,
    address,
    Coin.fromAmino({ amount: "1", denom: "uluna" })
  );
  const initMessage = new MsgInstantiateContract(address, address, 1, {});

  const theme = useTheme();

  return (
    <ScrollView
      style={{ marginVertical: 50, backgroundColor: theme.colors.background }}
    >
      <PrettyMessage message={messageSend.toAmino()} />
      <PrettyMessage message={messageDelegate.toAmino()} />
      <PrettyMessage message={messageUndelegate.toAmino()} />
      <PrettyMessage message={messageNewAccount.toAmino()} />
      <PrettyMessage message={instantiateMessage.toAmino()} />
      <PrettyMessage message={ExecuteMessage.toAmino()} />
      <PrettyMessage message={unknownMessage.toAmino()} />
      <PrettyMessage message={initMessage.toAmino()} />
    </ScrollView>
  );
}
