import { useTheme } from "@emotion/react";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { useIntl } from "react-intl";
import { TouchableOpacity, View } from "react-native";

import { KeyFlow } from "../../../../router";
import { Text } from "../../../typography";

export enum EmailTab {
  EmailKeyV1,
  EmailKeyZK,
}

export interface EmailTabsProps {
  selectedTab: EmailTab;
  children: ReactNode;
  flow: KeyFlow;
  isObi?: boolean;
  onPress: (tab: EmailTab) => void;
}

export const EmailTabs = observer<EmailTabsProps>(function EmailTypeTabs({
  selectedTab,
  children,
  flow,
  isObi = false,
  onPress,
}) {
  const intl = useIntl();
  const theme = useTheme();

  function renderTabButton({
    tab,
    label,
    isObi = false,
  }: {
    tab: EmailTab;
    label: string;
    isObi?: boolean;
  }) {
    console.log({ label });
    return (
      <View
        style={{
          flex: 1,
          ...(isObi && {
            borderBottomColor: "rgba(250,250,250,.2)",
            borderBottomWidth: 1,
          }),
        }}
      >
        <TouchableOpacity
          onPress={() => {
            onPress(tab);
          }}
          style={{
            flex: 1,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
            borderTopLeftRadius: tab === EmailTab.EmailKeyV1 ? 12 : 0,
            borderTopRightRadius: tab === EmailTab.EmailKeyZK ? 12 : 0,
            ...(selectedTab === tab && !isObi
              ? { backgroundColor: "#130F23" }
              : {}),
          }}
        >
          <Text
            style={{
              color: selectedTab === tab && !isObi ? "#89F5C2" : "white",
              ...(selectedTab === tab
                ? theme.textStyles.bold
                : theme.textStyles.light),
            }}
          >
            {label}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          // backgroundColor: "blue",
          height: 50,
          marginTop: 50,
          marginBottom: 20,
          marginHorizontal: isObi ? 10 : 0,
        }}
      >
        {renderTabButton({
          tab: EmailTab.EmailKeyV1,
          label: intl.formatMessage({
            id: "keys.email.tabs.simplekey",
            defaultMessage: "Simple 1 Use Key",
          }),
          isObi,
        })}

        {flow !== KeyFlow.RecoverWallet &&
          renderTabButton({
            tab: EmailTab.EmailKeyZK,
            label: intl.formatMessage({
              id: "keys.email.tabs.zkkey",
              defaultMessage: "Zero Knowledge Key",
            }),
            isObi,
          })}
      </View>
      {children}
    </>
  );
});
