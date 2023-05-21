import { Button, ScreenContainer, Text, useStore } from "@obi-wallet/common";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { FC, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SvgProps } from "react-native-svg";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import KeplrIcon from "./assets/keplr.svg";
import StationIcon from "./assets/station.svg";

export type ImportLegacyAccountScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.ImportLegacyAccount
>;

enum LegacyAccountType {
  Keplr = "keplr",
  Station = "station",
}

const legacyAccountTypeMetaData = {
  [LegacyAccountType.Keplr]: {
    name: "Keplr",
    Image: KeplrIcon,
  },
  [LegacyAccountType.Station]: {
    name: "Station",
    Image: StationIcon,
  },
};

interface LegacyAccountItem {
  type: LegacyAccountType;
  route: readonly [AccountsRoute.ImportBipMnemonic, { path: string }];
}

function parseBip(bip: { path: string }): LegacyAccountItem | null {
  switch (bip.path) {
    case "m/44'/118'/0'/0/0":
      return {
        type: LegacyAccountType.Keplr,
        route: [AccountsRoute.ImportBipMnemonic, bip] as const,
      };
    case "m/44'/330'/0'/0/0":
      return {
        type: LegacyAccountType.Station,
        route: [AccountsRoute.ImportBipMnemonic, bip] as const,
      };
    default:
      return null;
  }
}

export const ImportLegacyAccountScreen =
  observer<ImportLegacyAccountScreenProps>(function ImportLegacyAccountScreen({
    navigation,
  }) {
    const { chainStore } = useStore();
    const bip = chainStore.currentChainInformation.bip;
    const legacyAccountItems = bip
      .map(parseBip)
      .filter((x): x is LegacyAccountItem => x !== null);
    const [selected, setSelected] = useState<LegacyAccountItem | null>(null);

    const getAccountTypeText = () => {
      switch (selected?.type) {
        case LegacyAccountType.Keplr: {
          return (
            <>
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  marginVertical: 15,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Import Keplr Account
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "white",
                  textAlign: "center",
                }}
              >
                Import a traditional, seed phrase account from{" "}
                <Text style={{ fontWeight: "bold" }}>Keplr</Text> to use in the
                Obi interface. Multi-Key and other functionality is not
                available for this account type.
              </Text>
            </>
          );
        }
        case LegacyAccountType.Station: {
          return (
            <>
              <Text
                style={{
                  color: "white",
                  fontSize: 16,
                  marginVertical: 15,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Import Station Account
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: "white",
                  textAlign: "center",
                }}
              >
                Import a traditional, seed phrase account from{" "}
                <Text style={{ fontWeight: "bold" }}>Station</Text> to use in
                the Obi interface. Multi-Key and other functionality is not
                available for this account type.
              </Text>
            </>
          );
        }
        default:
          return (
            <Text style={{ fontSize: 14, color: "white", textAlign: "center" }}>
              Select which type of account you would like to import
            </Text>
          );
      }
    };

    return (
      <ScreenContainer>
        <ScrollView
          style={{
            flex: 1,
            marginTop: 20,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 16,
              marginBottom: 15,
              textAlign: "center",
            }}
          >
            Choose Account Type
          </Text>
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            {legacyAccountItems.map((account) => {
              const metaData = legacyAccountTypeMetaData[account?.type];
              return (
                <AccountElement
                  key={metaData.name}
                  Image={metaData.Image}
                  selected={selected === account}
                  onPress={() => {
                    setSelected(account);
                  }}
                />
              );
            })}
          </View>
          {getAccountTypeText()}
        </ScrollView>
        <View style={{ marginTop: 20 }}>
          <Button
            flavor="blue"
            onPress={() => {
              if (selected?.route) {
                navigation.navigate(...selected.route);
              }
            }}
            label="Confirm"
          />
          <Button
            flavor="cancel"
            onPress={() => {
              navigation.goBack();
            }}
            label="Cancel"
          />
        </View>
      </ScreenContainer>
    );
  });

const AccountElement = observer(function AccountElement({
  Image,
  selected,
  onPress,
}: {
  Image: FC<SvgProps>;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={{
        width: 100,
        height: 100,
        borderRadius: 16,
        backgroundColor: selected ? "#2D2D2D" : "#1D1D1D",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: selected ? 2 : 0,
        borderColor: "white",
        margin: 10,
      }}
      onPress={() => onPress()}
    >
      <Image />
    </TouchableOpacity>
  );
});
