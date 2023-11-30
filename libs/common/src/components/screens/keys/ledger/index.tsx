import { AccountData, makeSignDoc } from "@cosmjs/amino";
import { MultisigKey } from "@obi-wallet/sdk";
import { useIsFocused } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { ReactNode, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import { View } from "react-native";
import { pubkeyToAddress } from "secretjs";

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

export enum LedgerViews {
  Form = "form",
  ConnectionRequest = "connection_request",
  OpenSecretRequest = "open_secret_request",
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
      // setView(LedgerViews.ConnectionRequest);
      const {
        accounts: [acc],
      } = await getLedgerSinger(data.accountNumber);
      setAccount(acc);
      setView(LedgerViews.ConnectionComplete);
    } catch (e) {
      const { message } = e as Error;
      if (message.includes("0x5515")) {
        setView(LedgerViews.ConnectionRequest);
        return;
      } else if (message.includes("BOLOS")) {
        setView(LedgerViews.OpenSecretRequest);
        return;
      }
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
      await ledgerSigner.signAmino(account.address, signDoc);

      onPressRef.current!();
    } catch (e) {
      const { message } = e as Error;
      console.error(message);
    }
  };
  const isKeyboardVisible = useKeyboardVisible();

  const renderView = (v: LedgerViews): ReactNode =>
    (
      ({
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
        [LedgerViews.OpenSecretRequest]: (
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
        ),
        [LedgerViews.ConnectionComplete]: (
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            {!isKeyboardVisible ? (
              <>
                <Text
                  style={{
                    color: "#F6F5FF",
                    fontSize: isSmallScreenNumber(20, 24),
                    fontWeight: "600",
                    marginTop: isSmallScreenNumber(20, 32),
                    textAlign: "center",
                  }}
                >
                  {flow === KeyFlow.RecoverWallet ? (
                    <FormattedMessage
                      id="recovery.ledgerkey.signature"
                      defaultMessage="Check your Secret Ledger App"
                    />
                  ) : (
                    <FormattedMessage
                      id="ledgerkey.signature"
                      defaultMessage="Set a Ledger Key"
                    />
                  )}
                </Text>

                <Text
                  style={{
                    color: "#fff",
                    fontSize: isSmallScreenNumber(12, 14),
                    marginTop: 10,
                  }}
                >
                  <FormattedMessage
                    id="onboarding5.setbip32accountindex"
                    defaultMessage="During key submission, follow the steps on your ledger"
                  />
                </Text>
                <VerifyAndProceedButton
                  labelOverride="Submit Ledger Key"
                  // disabled={!}
                  onPress={handleSignTx}
                />
              </>
            ) : null}
          </View>
        ),
      }) as unknown as { [keys in LedgerViews]?: ReactNode }
    )[v];

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

  return (
    <LedgerContainer>
      {view !== LedgerViews.ConnectionComplete ? (
        <LedgerKeyForm flow={flow} submitter={handleConnectSecret}>
          {renderView(view)}
        </LedgerKeyForm>
      ) : (
        renderView(view)
      )}
    </LedgerContainer>
  );
});
