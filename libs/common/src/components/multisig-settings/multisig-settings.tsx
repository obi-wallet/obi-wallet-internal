import { useTheme } from "@emotion/react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { faCog } from "@fortawesome/free-solid-svg-icons/faCog";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { KeyType, MultisigKey } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { ReactNode, useState } from "react";
import { FormattedMessage } from "react-intl";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  KeyBottomSheetContent,
  KeyBottomSheetContentProps,
} from "./key-bottom-sheet-content";
import { useKeyMetaData } from "./key-meta-data";
import { Key, KeysList } from "./keys-list";
import { useStore } from "../../contexts";
import { isSmallScreenNumber, isWeb } from "../../helpers";
import { BottomSheetNew } from "../bottom-sheet";
import { CheckIcon, MultisigKeysIcon, WarningIcon } from "../icons";
import { OsmosisScreenContainer } from "../osmosis-screen-container";
import { Text } from "../typography";

export interface MultisigSettingsProps {
  children?: ReactNode;
  title: string;
  subTitle: string;
  draftId: string;
  actions: Partial<Record<KeyType, KeyBottomSheetContentProps["action"]>>;
}

export const MultisigSettings = observer<MultisigSettingsProps>(
  function MultisigSettings({ children, draftId, title, subTitle, actions }) {
    const { draftsStore } = useStore();
    const draft = draftsStore.get<MultisigKey>({ id: draftId });

    const multisigKey = draft.value;
    const [selectedType, setSelectedType] = useState<KeyType | null>(null);
    const theme = useTheme();

    const keyMetaData = useKeyMetaData();

    function getKey(type: KeyType): Key {
      const activated = multisigKey.hasKeyOfType(type);
      const key = multisigKey.getKeyOfType(type);

      const getIcon = () => {
        if (activated) {
          return key?.isUsable ? <CheckIcon /> : <WarningIcon />;
        }
        return (
          <FontAwesomeIcon
            icon={theme.style === "ztx" ? faPlus : faCog}
            style={{ color: "white" }}
          />
        );
      };

      return {
        type,
        right: getIcon(),
        onPress: () => {
          setSelectedType(type);
        },
        ...(activated &&
          !key?.isUsable && {
            description: "Setup required",
          }),
      };
    }

    const data = keyMetaData.keys.map(getKey);
    const activatedKeys = multisigKey.keys.length;

    return (
      <OsmosisScreenContainer>
        <SafeAreaView
          style={{
            paddingHorizontal: 22,
            paddingTop: 36,
            flex: 1,
          }}
        >
          <View>
            {theme.style === "ztx" ? (
              <View style={{ flexDirection: "row" }}>
                <Text style={theme.titleFalvors.title}>
                  {title.split(" ")[0]}
                </Text>
                {title.replace(title.split(" ")[0], "") && (
                  <Text style={theme.titleFalvors.subTitle}>
                    {` ${title.split(" ")[1].toLowerCase()}`}
                  </Text>
                )}
              </View>
            ) : (
              <Text style={theme.titleFalvors.title}>{title}</Text>
            )}
            <View
              style={{
                marginTop: 36,
                borderRadius: 3,
                backgroundColor: "#24242E",
                padding: 16,
              }}
            >
              <Text style={styles.subHeading}>{subTitle}</Text>
            </View>
          </View>
          {isWeb() ? (
            <View
              style={[
                {
                  paddingVertical: 10,
                  backgroundColor: "white",
                  borderRadius: 32,
                  paddingHorizontal: 20,
                  justifyContent: "space-between",
                  flexDirection: "row",
                  marginTop: 20,
                },
                theme.keyManagement?.threshold?.container,
              ]}
            >
              <Text
                style={[
                  { color: theme.colors.background, fontWeight: "bold" },
                  theme.keyManagement?.threshold?.threshold,
                ]}
              >
                {`Threshold${theme.style === "ztx" && ": "}`}
              </Text>
              <Text
                style={[
                  { color: theme.colors.background, fontWeight: "bold" },
                  theme.keyManagement?.threshold?.activated,
                ]}
              >
                {`${multisigKey.threshold}${
                  theme.style === "ztx" ? "/" : "of"
                }${activatedKeys}`}
              </Text>
            </View>
          ) : (
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <View
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MultisigKeysIcon keys={activatedKeys} />
                <Text
                  style={[
                    styles.heading,
                    {
                      position: "absolute",
                      fontSize: 24,
                    },
                  ]}
                >
                  {multisigKey.threshold}/{activatedKeys}
                </Text>
              </View>

              <Text
                style={[
                  styles.heading,
                  {
                    marginTop: 0,
                    fontSize: isSmallScreenNumber(14, 18),
                    marginBottom: 8,
                  },
                ]}
              >
                <FormattedMessage
                  id="settings.multisig.risk.high"
                  defaultMessage="Security Tier: Basic"
                />
              </Text>
            </View>
          )}
          <View style={{ flex: 1, marginTop: 20 }}>
            <KeysList data={data} />
          </View>
          <View>{children}</View>
          <BottomSheetNew
            open={selectedType !== null}
            onClose={() => {
              setSelectedType(null);
            }}
          >
            {selectedType ? (
              <KeyBottomSheetContent
                type={selectedType}
                action={actions[selectedType]}
                multisigKey={multisigKey}
                onClose={() => {
                  setSelectedType(null);
                }}
              />
            ) : null}
          </BottomSheetNew>
        </SafeAreaView>
      </OsmosisScreenContainer>
    );
  },
);

const styles = StyleSheet.create({
  heading: {
    color: "#F6F5FF",
    fontSize: isSmallScreenNumber(18, 24),
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 10,
  },
  subHeading: {
    color: "#F6F8FC",
    fontSize: isSmallScreenNumber(10, 14),
  },
});
