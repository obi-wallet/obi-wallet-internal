import { useTheme } from "@emotion/react";
import { ScrollView } from "react-native-gesture-handler";

import {
  createSessionKey,
  destroySessionKey,
  ExecuteMessage,
  initMessage,
  instantiateMessage,
  messageDelegate,
  messageNewAccount,
  messageSend,
  messageUndelegate,
  rmFlex,
  unknownMessage,
  upsertBeneficiary,
  upsertBeneficiaryAnnually,
  upsertFlex,
} from "../__fixtures__/messages";
import { PrettyMessage } from "../src";

export default function PrettyMessages() {
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
      <PrettyMessage message={upsertFlex.toAmino()} />
      <PrettyMessage message={rmFlex.toAmino()} />
      <PrettyMessage message={createSessionKey.toAmino()} />
      <PrettyMessage message={destroySessionKey.toAmino()} />
      <PrettyMessage message={upsertBeneficiary.toAmino()} />
      <PrettyMessage message={upsertBeneficiaryAnnually.toAmino()} />
    </ScrollView>
  );
}
