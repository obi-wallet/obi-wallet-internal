import {
  faCaretDown,
  faCaretUp,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Bech32Address } from "@keplr-wallet/cosmos";
import {
  Beneficiary,
  EntityId,
  FlexAccount,
  GatekeeperConfig,
  SinglesigWallet,
  terra,
  Text,
  TextInput,
} from "@obi-wallet/common";
import Slider from "@react-native-community/slider";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  FlatList,
  ImageBackground,
  LayoutAnimation,
  Platform,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  UIManager,
  View,
  ViewStyle,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { useDebouncedValue } from "rooks";

import { AccountsRoute, AccountsStackParamList } from "./accounts-stack";
import KeyRoundIcon from "./assets/key-round-icon.svg";
import { getGatekeeperConfigDraftId } from "./draft-id";
import { UsdBalance } from "../../app/balances";
import { Button } from "../../app/button";
import { Background } from "../../app/screens/components/background";
import { NetworkAccountPickerLayout } from "../../app/screens/components/network-account-picker-layout";
import { useMultisigWallet, useStore } from "../../app/stores";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export type AccountsOverviewScreenProps = NativeStackScreenProps<
  AccountsStackParamList,
  AccountsRoute.AccountsOverview
>;

export const AccountsOverviewScreen = observer<AccountsOverviewScreenProps>(
  function AccountsOverviewScreen({ navigation }) {
    return (
      <>
        <Background />
        <NetworkAccountPickerLayout>
          <View style={{ flex: 1, position: "relative" }}>
            <AccountScreenInner />
            <View
              style={{
                position: "absolute",
                zIndex: 10,
                right: 20,
                bottom: 20,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: "#437DFF",
                  padding: 16,
                  borderRadius: 100,
                }}
                onPress={() => {
                  navigation.navigate(AccountsRoute.AddAccount);
                }}
              >
                <FontAwesomeIcon icon={faPlus} style={{ color: "#F6F5FF" }} />
              </TouchableOpacity>
            </View>
          </View>
        </NetworkAccountPickerLayout>
      </>
    );
  }
);

const AccountScreenInner = observer(function AccountScreenInner() {
  const { configStore } = useStore();
  const isLoop = configStore.isLoop();

  return (
    <View style={{ paddingHorizontal: 10, flex: 1 }}>
      <View
        style={{
          backgroundColor: isLoop ? "#1C0C3F" : "#437DFF",
          borderRadius: 16,
        }}
      >
        <ImageBackground
          source={
            isLoop ? require("./assets/loop-account-background.png") : null
          }
          style={{ padding: 10, position: "relative" }}
          resizeMode="cover"
          borderRadius={16}
        >
          <TouchableOpacity style={{ position: "absolute", top: 6, left: 6 }}>
            <KeyRoundIcon />
          </TouchableOpacity>
          <View
            style={{
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "column" }}>
                <Text
                  style={{
                    color: "#F6F5FF",
                    fontSize: 18,
                    fontWeight: "700",
                  }}
                >
                  <FormattedMessage
                    id="accountscreen.accountname"
                    defaultMessage="Obi Smart Account"
                  />
                </Text>
              </View>
            </View>

            <View
              style={{
                marginTop: 10,
              }}
            >
              <UsdBalance />
            </View>
          </View>
        </ImageBackground>
      </View>
      <View style={{ flex: 1 }}>
        <AccountsList />
      </View>
    </View>
  );
});

const AccountsList = observer(function AccountsList() {
  const { draftsStore } = useStore();
  const wallet = useMultisigWallet();

  const draftId = getGatekeeperConfigDraftId(wallet);
  const draft = draftsStore.get<GatekeeperConfig>({
    id: draftId,
  });

  const accounts = wallet.getAccounts(draft.value);
  const [itemOpened, setItemOpened] = useState<EntityId | null>(null);
  const [activeAccount, setActiveAccount] = useState<EntityId | null>(null);

  const data = accounts.ids.map((id) => {
    return {
      id,
      account: accounts.get({ id }),
    };
  });

  return (
    <FlatList
      data={data}
      renderItem={(element) => {
        return (
          <AccountItem
            onOpenToggle={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              itemOpened === element.item.id
                ? setItemOpened(null)
                : setItemOpened(element.item.id);
            }}
            isOpen={itemOpened === element.item.id}
            onSetActive={() => {
              setActiveAccount(element.item.id);
            }}
            active={activeAccount === element.item.id}
            account={element.item.account}
          />
        );
      }}
      keyExtractor={(item) => item.id}
    />
  );
});

interface AbstractAccountItemProps {
  active: boolean;
  onSetActive: () => void;
  isOpen: boolean;
  onOpenToggle: () => void;
}

interface AccountItemProps extends AbstractAccountItemProps {
  account: Beneficiary | FlexAccount | SinglesigWallet;
}

const AccountItem = observer<AccountItemProps>(function AccountItem({
  account,
  ...props
}) {
  switch (account.type) {
    case "beneficiary":
      return <BeneficiaryItem account={account} {...props} />;
    case "flex-account":
      return <FlexAccountItem account={account} {...props} />;
    case "singlesig-wallet":
      return <SinglesigWalletItem account={account} {...props} />;
  }
});

interface BeneficiaryItemProps extends AbstractAccountItemProps {
  account: Beneficiary;
}

const BeneficiaryItem = observer<BeneficiaryItemProps>(
  function BeneficiaryItem({
    isOpen,
    onOpenToggle,
    account,
    active,
    onSetActive,
  }) {
    const inheritancePeriodicity = ["Monthly", "Annually"];
    const [selectedPeriodicity, setSelectedPeriodicity] = useState(
      inheritancePeriodicity[0]
    );
    return (
      <AccountContainer
        isOpen={isOpen}
        onOpenToggle={onOpenToggle}
        title={account.meta.name}
        subTitle="Inheritance"
        subTitleStyles={{
          color: "white",
        }}
        active={active}
        onSetActive={onSetActive}
      >
        <>
          {isOpen && (
            <Animatable.View
              duration={400}
              animation={isOpen ? "fadeIn" : "fadeOut"}
              style={{
                backgroundColor: "#363636",
                borderRadius: 7,
                marginTop: 10,
                paddingVertical: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  marginHorizontal: 35,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "white",
                    marginRight: 10,
                    flex: 1,
                  }}
                >
                  Inheritance triggers after how many months of inactivity?
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#272727",
                    borderRadius: 7,
                    paddingHorizontal: 10,
                    color: "white",
                    fontSize: 26,
                    fontFamily: "Poppins",
                  }}
                  value="12"
                  keyboardType="numeric"
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  marginHorizontal: 35,
                  alignItems: "center",
                  marginTop: 30,
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "white",
                    marginRight: 10,
                    flex: 1,
                  }}
                >
                  Recipient receives funds at the following rate (%):
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#272727",
                    borderRadius: 7,
                    paddingHorizontal: 10,
                    color: "white",
                    fontSize: 26,
                    fontFamily: "Poppins",
                    alignSelf: "flex-end",
                  }}
                  value="12"
                  keyboardType="numeric"
                />
              </View>
              <View
                style={{
                  flexDirection: "row",
                  flex: 1,
                  justifyContent: "space-around",
                  marginTop: 30,
                }}
              >
                {inheritancePeriodicity.map((item) => (
                  <Pill
                    label={item}
                    active={item === selectedPeriodicity}
                    key={item}
                    onPress={() => {
                      setSelectedPeriodicity(item);
                    }}
                  />
                ))}
              </View>
              <View style={{ margin: 15 }}>
                <Button flavor="blue" label="Confirm" />
                <TouchableOpacity>
                  <Text
                    style={{
                      color: "#437DFF",
                      textAlign: "center",
                      margin: 10,
                    }}
                  >
                    Delete Flex Account
                  </Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          )}
        </>
      </AccountContainer>
    );
  }
);

interface FlexAccountItemProps extends AbstractAccountItemProps {
  account: FlexAccount;
}

enum FlexAccountPeriodicity {
  Daily = "Daily",
  Weekly = "Weekly",
  Monthly = "Monthly",
  Yearly = "Yearly",
}

enum FlexAccountRule {
  Strict = "Strict",
  Limited = "Limited",
  Unlocked = "Unlocked",
}

const FlexAccountItem = observer<FlexAccountItemProps>(function FlexItem({
  isOpen = true,
  onOpenToggle,
  account,
  active = false,
  onSetActive,
}) {
  const [amount, setAmount] = useState(10);
  const [timeOpened, setTimeOpened] = useState(false);
  const periodicity = [
    FlexAccountPeriodicity.Daily,
    FlexAccountPeriodicity.Weekly,
    FlexAccountPeriodicity.Monthly,
    FlexAccountPeriodicity.Yearly,
  ];
  const [selectedPeriod, setSelectedPeriod] = useState(periodicity[0]);
  const flexRules = [
    FlexAccountRule.Strict,
    FlexAccountRule.Limited,
    FlexAccountRule.Unlocked,
  ];

  const [debouncedAmount] = useDebouncedValue(amount, 50);

  const getRemainingTime = useCallback(() => {
    if (!account.autoSign) return null;

    const remainingTime = DateTime.fromISO(account.autoSign?.endTime).diff(
      DateTime.now(),
      "seconds"
    );
    return remainingTime.toMillis() >= 0 ? remainingTime : null;
  }, [account.autoSign]);

  const [remainingTime, setRemainingTime] = useState(getRemainingTime);

  const getActiveFlexRule = useCallback(() => {
    if (account.autoSign && getRemainingTime()) {
      return FlexAccountRule.Unlocked;
    } else if (account.spendLimit) {
      return FlexAccountRule.Limited;
    } else {
      return FlexAccountRule.Strict;
    }
  }, [account.autoSign, account.spendLimit, getRemainingTime]);
  const [activeFlexRule, setActiveFlexRule] = useState(getActiveFlexRule);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlexRule(getActiveFlexRule());
      setRemainingTime(getRemainingTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [getActiveFlexRule, getRemainingTime]);

  const getRuleText = () => {
    switch (activeFlexRule) {
      case FlexAccountRule.Unlocked:
        return "WARNING: No keys required to sign transactions. This setting will revert after 30:00 minutes or until session expires.";
      case FlexAccountRule.Strict:
        return "All transactions will require X keys to complete.";
      case FlexAccountRule.Limited:
        return "Transactions under limit amount only require one key.";
    }
  };

  return (
    <AccountContainer
      isOpen={isOpen}
      onOpenToggle={onOpenToggle}
      title={account.meta.name}
      subTitle={`${activeFlexRule} Flex Account${
        remainingTime ? ` ⏱ ${remainingTime.toFormat("m:ss")}` : ""
      }`}
      subTitleStyles={{
        color: activeFlexRule === flexRules[2] ? "#FFE200" : "white",
      }}
      active={active}
      onSetActive={onSetActive}
    >
      <ProgressBar amount={70} containerStyle={{ marginVertical: 10 }} />
      <Animatable.View
        duration={400}
        animation={isOpen ? "fadeIn" : "fadeOut"}
        style={{ backgroundColor: "#363636", borderRadius: 7 }}
      >
        {isOpen && (
          <>
            <View
              style={{
                marginTop: 10,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  margin: 5,
                  fontSize: 12,
                  marginBottom: 20,
                }}
              >
                Flex Rules
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flex: 1,
                  justifyContent: "space-around",
                }}
              >
                {flexRules.map((fr) => (
                  <Pill
                    label={fr}
                    active={fr === activeFlexRule}
                    key={fr}
                    onPress={() => {
                      setActiveFlexRule(fr);
                    }}
                  />
                ))}
              </View>
              <View style={{ padding: 10 }}>
                <Text style={{ color: "#fff", fontSize: 12 }}>
                  {getRuleText()}
                </Text>
              </View>
              <View
                style={{
                  alignItems: "center",
                  opacity: activeFlexRule === flexRules[1] ? 1 : 0.5,
                }}
              >
                <View style={{ flexDirection: "row" }}>
                  {!timeOpened ? (
                    <>
                      <TextInput
                        style={{
                          backgroundColor: "#272727",
                          borderWidth: 0,
                          borderRadius: 10,
                          color: "#fff",
                          padding: 5,
                          paddingHorizontal: 20,
                          fontSize: 25,
                          fontFamily: "Poppins",
                        }}
                        value={`$${amount}`}
                        editable={activeFlexRule === flexRules[1]}
                        onChangeText={(value) => {
                          const res = value.replace(/[^0-9.]/g, "");
                          console.log({ res });
                          setAmount(Number(res));
                        }}
                      />
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 10,
                        }}
                        onPress={() => setTimeOpened(true)}
                        disabled={activeFlexRule !== flexRules[1]}
                      >
                        <Text style={{ color: "#fff" }}>{selectedPeriod}</Text>
                        <FontAwesomeIcon
                          icon={faCaretDown}
                          style={{ color: "#fff" }}
                        />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      {periodicity.map((period) => (
                        <TouchableOpacity
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            padding: 10,
                            backgroundColor:
                              selectedPeriod === period
                                ? "#437DFF"
                                : "transparent",
                            borderRadius: 10,
                          }}
                          onPress={() => {
                            setSelectedPeriod(period);
                            setTimeOpened(false);
                          }}
                          key={period}
                        >
                          <Text style={{ color: "#fff" }}>{period}</Text>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}
                </View>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingHorizontal: 10,
                }}
              >
                <Slider
                  style={{
                    flex: 1,
                  }}
                  minimumTrackTintColor="#437DFF"
                  maximumTrackTintColor="#7E7E7E"
                  maximumValue={500}
                  minimumValue={0}
                  step={1}
                  onValueChange={(value) => {
                    setAmount(value);
                  }}
                  disabled={activeFlexRule !== flexRules[1]}
                  value={(debouncedAmount || 0) as number}
                />
              </View>
              <View style={{ margin: 15 }}>
                <Button flavor="blue" label="Confirm" />
                <TouchableOpacity>
                  <Text
                    style={{
                      color: "#437DFF",
                      textAlign: "center",
                      margin: 10,
                    }}
                  >
                    Delete Flex Account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </Animatable.View>
    </AccountContainer>
  );
});

interface SinglesigWalletItemProps extends AbstractAccountItemProps {
  account: SinglesigWallet;
}

const SinglesigWalletItem = observer<SinglesigWalletItemProps>(
  function SinglesigWalletItem({ account, active, onSetActive }) {
    return (
      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderRadius: 7,
          borderColor: active ? "white" : "transparent",
          backgroundColor: "#272727",
          marginVertical: 10,
          padding: 10,
        }}
        onPress={() => {
          onSetActive();
        }}
        disabled={active}
      >
        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              width: 40,
              aspectRatio: 1 / 1,
              backgroundColor: "white",
              borderRadius: 6,
            }}
          />
          <View style={{ paddingLeft: 10 }}>
            <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
              $45.00
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#7E7E7E",
              }}
            >
              {Bech32Address.shortenAddress(
                terra.getAddress({ publicKey: account.publicKey }),
                40
              )}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
);

const Pill = observer<{
  label: string;
  active?: boolean;
  onPress?: () => void;
}>(function Pill({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: active ? "#437DFF" : "transparent",
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
      }}
      onPress={onPress}
    >
      <Text style={{ color: "#fff", fontSize: 12 }}>{label}</Text>
    </TouchableOpacity>
  );
});

const AccountContainer = observer<{
  children?: ReactNode;
  isOpen: boolean;
  onOpenToggle: () => void;
  title: string;
  subTitle: string;
  titleStyles?: StyleProp<TextStyle>;
  subTitleStyles?: StyleProp<TextStyle>;
  active?: boolean;
  onSetActive: () => void;
  collapsible?: boolean;
}>(function AccountContainer({
  children,
  isOpen,
  onOpenToggle,
  title,
  subTitle,
  titleStyles,
  subTitleStyles,
  active,
  onSetActive,
}) {
  return (
    <Animatable.View
      duration={400}
      style={{
        borderWidth: 1,
        borderRadius: 7,
        borderColor: active ? "white" : "transparent",
        backgroundColor: "#272727",
        marginVertical: 10,
        padding: 10,
      }}
    >
      <TouchableOpacity
        style={{ flexDirection: "row" }}
        onPress={onSetActive}
        disabled={active}
      >
        <View
          style={{
            width: 40,
            aspectRatio: 1 / 1,
            backgroundColor: "white",
            borderRadius: 6,
          }}
        />
        <View style={{ paddingLeft: 10 }}>
          <Text
            style={[
              {
                color: "white",
                fontSize: 18,
                fontWeight: "600",
              },
              titleStyles,
            ]}
          >
            {title}
          </Text>
          <Text
            style={[
              {
                fontSize: 12,
              },
              subTitleStyles,
            ]}
          >
            {subTitle}
          </Text>
        </View>
      </TouchableOpacity>

      {children && (
        <TouchableOpacity
          onPress={onOpenToggle}
          style={{
            position: "absolute",
            right: 5,
            top: 5,
            paddingLeft: 10,
            paddingBottom: 10,
          }}
        >
          <View
            style={{
              width: 20,
              aspectRatio: 1 / 1,
              backgroundColor: "white",
              borderRadius: 100,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FontAwesomeIcon icon={isOpen ? faCaretUp : faCaretDown} />
          </View>
        </TouchableOpacity>
      )}
      {children}
    </Animatable.View>
  );
});

const ProgressBar = observer(function ProgressBar({
  amount,
  containerStyle,
  barStyle,
}: {
  amount: number;
  containerStyle?: ViewStyle;
  barStyle?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: "#363636",
          borderRadius: 20,
          height: 10,
        },
        containerStyle,
      ]}
    >
      <View
        style={[
          {
            backgroundColor: "#437DFF",
            height: 10,
            width: `${amount}%`,
            borderRadius: 20,
          },
          barStyle,
        ]}
      />
    </View>
  );
});
