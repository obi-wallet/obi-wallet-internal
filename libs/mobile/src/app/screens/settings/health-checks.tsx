import { useTheme } from "@emotion/react";
import { Alert, Text } from "@obi-wallet/common";
import { Back } from "@obi-wallet/common";
import { healthChecks, JunoChecks } from "@obi-wallet/common-deprecated";
import { useCurrentWallet } from "@obi-wallet/headless-ui";
import { MultisigWallet } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import WarningIcon from "../../../assets/warning.svg";

export const HealthChecksScreen = observer(function HealthChecksScreen() {
  const intl = useIntl();
  const wallet = useCurrentWallet();
  const [problems, setProblems] = useState<string[] | undefined>();
  const theme = useTheme();
  const refetchProblems = useCallback(async () => {
    const currentChain = wallet.chainId;
    const { types, checks } = healthChecks[currentChain];

    const potentialProblems = await Promise.all(
      R.map(async (type) => {
        const isProblem = !(await checks[type](wallet));
        return {
          type,
          isProblem,
        };
      }, types)
    );
    setProblems(
      potentialProblems
        .filter(({ isProblem }) => isProblem)
        .map(({ type }) => type)
    );
  }, [wallet]);

  useEffect(() => {
    setProblems(undefined);
    void refetchProblems();
  }, [refetchProblems]);

  const problemsData: Record<
    string,
    {
      title: ReactNode;
      description?: ReactNode;
      getOnPress: (wallet: MultisigWallet) => () => Promise<void>;
    }
  > = {
    [JunoChecks.CORRECT_ADMIN]: {
      title: (
        <FormattedMessage
          id="settings.multisighealthchecks.juno.correctadmin.title"
          defaultMessage="Incorrect admin"
        />
      ),
      description: (
        <FormattedMessage
          id="settings.multisighealthchecks.juno.correctadmin.description"
          defaultMessage="The admin of your wallet is not correct."
        />
      ),
      getOnPress: () => {
        return async () => {
          Alert.alert(
            intl.formatMessage({
              id: "settings.multisighealthchecks.juno.correctadmin.message",
              defaultMessage:
                "Please move your funds out and create a new wallet.",
            })
          );
        };
      },
    },
  };
  const data = (problems || []).map((type) => {
    const { getOnPress, ...problemData } = problemsData[type];

    return {
      type,
      ...problemData,
      async onPress() {
        await getOnPress(wallet)();
      },
    };
  });

  return (
    <SafeAreaView
      style={{
        backgroundColor: theme.colors.background,
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 20,
      }}
    >
      <View style={{ flex: 2 }}>
        <Back style={{ alignSelf: "flex-start" }} />
        <Text style={styles.heading}>
          <FormattedMessage
            id="settings.multisighealthchecks.title"
            defaultMessage="Wallet Health"
          />
        </Text>
        {problems ? (
          <>
            <Text style={styles.subHeading}>
              {data.length > 0 ? (
                <FormattedMessage
                  id="settings.multisighealthchecks.subtitle.issues"
                  defaultMessage="We found potential issues with your wallet. Tap on them to resolve them."
                />
              ) : (
                <FormattedMessage
                  id="settings.multisighealthchecks.subtitle.healthy"
                  defaultMessage="We could not find any issues with your wallet."
                />
              )}
            </Text>
            <FlatList
              data={data}
              keyExtractor={(item) => item.type}
              renderItem={(props) => {
                return <ListItem {...props} />;
              }}
            />
          </>
        ) : null}
      </View>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  heading: {
    color: "#F6F5FF",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 30,
  },
  subHeading: {
    color: "#999CB6",
    fontSize: 14,
    marginBottom: 31,
  },
});

// TODO: extract common component (keys-list, account-picker-modal)
const ListItem = observer(function ListItem({
  item,
}: {
  item: {
    title: ReactNode;
    description?: ReactNode;
    onPress?: () => Promise<void>;
  };
}) {
  const { title, description, onPress } = item;

  return (
    <TouchableOpacity
      style={{
        height: 59,
        width: "100%",
        backgroundColor: "#111023",
        marginBottom: 10,
        flexDirection: "row",
        borderRadius: 12,
        paddingHorizontal: 10,
      }}
      onPress={onPress}
    >
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 10,
        }}
      >
        <View
          style={{
            backgroundColor: "#1D1C37",
            width: 36,
            height: 36,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 12,
          }}
        >
          <WarningIcon />
        </View>
      </View>
      <View style={{ justifyContent: "center", paddingHorizontal: 10 }}>
        <Text
          style={{
            color: "#F6F5FF",
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {title}
        </Text>
        {description ? (
          <Text
            style={{
              color: "#F6F5FF",
              fontSize: 12,
              opacity: 0.6,
              marginTop: 4,
            }}
          >
            {description}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
});
