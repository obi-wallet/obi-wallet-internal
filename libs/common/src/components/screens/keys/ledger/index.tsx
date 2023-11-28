import { AccountData, makeSignDoc } from "@cosmjs/amino";
import { useTheme } from "@emotion/react";
import { MultisigKey } from "@obi-wallet/sdk";
import { useIsFocused } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { View } from "react-native";
import { pubkeyToAddress } from "secretjs";
import invariant from "tiny-invariant";

import { LedgerContainer } from "./container";
import { LedgerKeyForm } from "./form";
import { useStore } from "../../../../contexts";
import { isSmallScreenNumber } from "../../../../helpers";
import { useKeyboardVisible } from "../../../../hooks";
import {
  KeyFlow,
  KeyRoute,
  KeyStackParamList,
  OnboardingRoute,
  SettingsRoute,
  useRootNavigation,
} from "../../../../router";
import { getLedgerSinger } from "../../../modals";
import { Text } from "../../../typography";
import { VerifyAndProceedButton } from "../../../verify-and-proceed-button";

export type LedgerKeyScreenProps = NativeStackScreenProps<
  KeyStackParamList,
  KeyRoute.LedgerKey
>;

export const LedgerKeyScreen = observer<LedgerKeyScreenProps>(
  function LedgerKeyScreen({ route }) {
    const { navigate } = useRootNavigation();
    const { params } = route;

    const isFocused = useIsFocused();
    if (!isFocused) return null;

    const onSubmit = () => {
      console.log("KEYFLOW", params.flow);
      switch (params.flow) {
        case KeyFlow.CreateWallet:
          navigate(OnboardingRoute.CreateWallet, params);
          break;
        case KeyFlow.RecoverWallet:
          navigate(OnboardingRoute.RecoverWallet, params);
          break;
        case KeyFlow.EditWallet:
          navigate(SettingsRoute.MultisigSettings);
          break;
      }
    };

    return <LedgerKey {...params} onSubmit={onSubmit}></LedgerKey>;
  },
);

export interface LedgerKeyProps {
  draftId: string;
  flow: KeyFlow;
  onSubmit(): void;
}

type SubmitLedgerKeyData = {
  accountNumber: number;
};

enum LedgerViews {
  Form = "form",
  ConnectionRequest = "connection_request",
  OpenSecret = "open_secret",
  ConnectionComplete = "connection_complete",
}

export const LedgerKey = observer<LedgerKeyProps>(function LedgerKey({
  draftId,
  flow,
  onSubmit,
}) {
  const { draftsStore } = useStore();
  const draft = draftsStore.get<MultisigKey>({ id: draftId });
  // const theme = useTheme();
  const [view, setView] = useState(LedgerViews.Form);
  const [account, setAccount] = useState<AccountData | undefined>();

  const handleConnectSecret = async (data: SubmitLedgerKeyData) => {
    try {
      setView(LedgerViews.ConnectionRequest);

      const {
        accounts: [acc],
      } = await getLedgerSinger(data.accountNumber);
      setAccount(acc);
      setView(LedgerViews.OpenSecret);
    } catch (e) {
      console.error("Failed to get Ledger signer", e);
      // invariant("Failed to get Ledger singer", signer);
      setView(LedgerViews.Form);
    }
  };

  const handleSignTx = async () => {
    try {
      const { ledgerSigner, accounts } = await getLedgerSinger();
      const [account] = accounts;
      const defaultFee = {
        amount: [{ amount: "10", denom: "uscrt" }],
        gas: "20000",
      };
      const address = draft.value.address;
      const msg = {
        type: "cosmos-sdk/MsgSend",
        value: {
          amount: [
            {
              amount: "10",
              denom: "uscrt",
            },
          ],
          from_address: account.address,
          to_address: pubkeyToAddress(Buffer.from(address, "base64"), "secret"),
        },
      };
      const signDoc = makeSignDoc([msg], defaultFee, "secret-4", "", 0, 0);
      const { signature } = await ledgerSigner.signAmino(
        account.address,
        signDoc,
      );
      console.log("Ledger signature", signature);
      onPressRef.current!();
    } catch (e) {
      if (e.message.includes("0x5515")) {
        invariant(
          e.message,
          "Make sure your Ledger is plugged in and unlocked",
        );
        return;
      } else if (e.message.includes("BOLOS")) {
        invariant(e.message, "Please open Secret App on your Ledger");
        return;
      }
    }
  };
  const isKeyboardVisible = useKeyboardVisible();

  const renderView = (v: LedgerViews) =>
    ({
      [LedgerViews.Form]: (
        <LedgerKeyForm flow={flow} submitter={handleConnectSecret} />
      ),
      [LedgerViews.ConnectionRequest]: (
        <Text
          style={{
            color: "#fff",
            fontSize: isSmallScreenNumber(12, 14),
            marginTop: 10,
          }}
        >
          <FormattedMessage
            id="connect-ledger"
            defaultMessage="Connect and unlock your Ledger"
          />
        </Text>
      ),
      [LedgerViews.OpenSecret]: (
        <>
          {account ? (
            <View
              style={{ flex: 1, justifyContent: "flex-end", marginBottom: 20 }}
            >
              {!isKeyboardVisible ? (
                <VerifyAndProceedButton
                  labelOverride="Create Key"
                  // disabled={!}
                  onPress={handleSignTx}
                />
              ) : null}
            </View>
          ) : (
            <Text
              style={{
                color: "#fff",
                fontSize: isSmallScreenNumber(12, 14),
                marginTop: 10,
              }}
            >
              <FormattedMessage
                id="connect-ledger"
                defaultMessage="Open Secret App on your ledger"
              />
            </Text>
          )}
        </>
      ),
      [LedgerViews.ConnectionComplete]: (
        <Text
          style={{
            color: "#fff",
            fontSize: isSmallScreenNumber(12, 14),
            marginTop: 10,
          }}
        >
          <FormattedMessage
            id="adding-complete"
            defaultMessage="The LedgerKey was successfully added"
          />
        </Text>
      ),
    })[v];

  const onPressRef = useRef<() => void>();
  onPressRef.current = async () => {
    const ledgerPubkeyString: string = btoa(
      String.fromCharCode(...account!.pubkey),
    );
    await draft.value.setLedgerKey({
      type: "tendermint/PubKeySecp256k1",
      value: ledgerPubkeyString,
    });
    onSubmit();
  };

  return <LedgerContainer>{renderView(view)}</LedgerContainer>;
});
