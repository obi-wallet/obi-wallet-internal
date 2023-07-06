import { useTheme } from "@emotion/react";
import { PrettyMessage, useStore } from "@obi-wallet/common";
import * as R from "ramda";
import { ScrollView } from "react-native";

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

export default function PrettyMessages() {
  const { chainStore } = useStore();
  const theme = useTheme();

  return (
    <ScrollView
      style={{ marginVertical: 50, backgroundColor: theme.colors.background }}
    >
      <PrettyMessage
        message={messageSend.toAmino()}
        chainId={chainStore.currentChain}
      />
      <PrettyMessage
        message={messageDelegate.toAmino()}
        chainId={chainStore.currentChain}
      />
      <PrettyMessage
        message={messageUndelegate.toAmino()}
        chainId={chainStore.currentChain}
      />
      <PrettyMessage
        message={
          R.has("osmo", messageNewAccount)
            ? messageNewAccount.osmo
            : messageNewAccount.toAmino()
        }
        chainId={chainStore.currentChain}
      />
      <PrettyMessage
        message={instantiateMessage.toAmino()}
        chainId={chainStore.currentChain}
      />
      <PrettyMessage
        message={ExecuteMessage.toAmino()}
        chainId={chainStore.currentChain}
      />
      <PrettyMessage
        message={unknownMessage.toAmino()}
        chainId={chainStore.currentChain}
      />
      <PrettyMessage
        message={initMessage.toAmino()}
        chainId={chainStore.currentChain}
      />
      <PrettyMessage
        message={upsertFlex.toAmino()}
        chainId={chainStore.currentChain}
      />
      <PrettyMessage
        message={rmFlex.toAmino()}
        chainId={chainStore.currentChain}
      />
      <PrettyMessage
        message={createSessionKey.toAmino()}
        chainId={chainStore.currentChain}
      />
      <PrettyMessage
        message={destroySessionKey.toAmino()}
        chainId={chainStore.currentChain}
      />
      <PrettyMessage
        message={upsertBeneficiary.toAmino()}
        chainId={chainStore.currentChain}
      />
      <PrettyMessage
        message={upsertBeneficiaryAnnually.toAmino()}
        chainId={chainStore.currentChain}
      />
    </ScrollView>
  );
}
