import {
  faPlus,
  faCaretUp,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import Slider from "@react-native-community/slider";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  FlatList,
  ImageBackground,
  LayoutAnimation,
  Platform,
  TextStyle,
  UIManager,
  View,
  ViewStyle,
} from "react-native";
import { TouchableOpacity, TextInput } from "react-native";
import { StyleProp } from "react-native";
import * as Animatable from "react-native-animatable";
import { useDebouncedValue } from "rooks";

import KeyRoundIcon from "./assets/key-round-icon.svg";
import { UsdBalance } from "../../balances";
import { Button } from "../../button";
import { useStore } from "../../stores";
import { Background } from "../components/background";
import { NetworkAccountPickerLayout } from "../components/network-account-picker-layout";

export const AccountScreen = observer(function AccountScreen() {
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
            >
              <FontAwesomeIcon icon={faPlus} style={{ color: "#F6F5FF" }} />
            </TouchableOpacity>
          </View>
        </View>
      </NetworkAccountPickerLayout>
    </>
  );
});

export const AccountScreenInner = observer(function AccountScreenInner() {
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
          source={isLoop ? require("./assets/accountbg.png") : null}
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
  const [itemOpened, setItemOpened] = useState<number | null>(null);
  const [activeAccount, setActiveAccount] = useState<number | null>(null);
  console.log({ itemOpened });
  return (
    <FlatList
      data={[1, 2, 3, 4, 5, 6]}
      renderItem={(element) => {
        console.log({ element });
        if (element.item < 3)
          return (
            <FlexAccountItem
              onOpenToggle={(selected) => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut
                );
                selected === itemOpened
                  ? setItemOpened(null)
                  : setItemOpened(selected);
              }}
              isOpen={Number(itemOpened) === Number(element.item)}
              account={element.item}
              active={activeAccount === element.item}
              setActive={() => setActiveAccount(element.item)}
            />
          );
        if (element.item === 3)
          return (
            <InheritanceAccountItem
              onOpenToggle={(selected) => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut
                );
                selected === itemOpened
                  ? setItemOpened(null)
                  : setItemOpened(selected);
              }}
              isOpen={Number(itemOpened) === Number(element.item)}
              account={element.item}
              active={activeAccount === element.item}
              setActive={() => setActiveAccount(element.item)}
            />
          );
        return (
          <LegacyAccountItem
            active={activeAccount === element.item}
            setActive={() => setActiveAccount(element.item)}
          />
        );
      }}
      keyExtractor={(item) => item.toString()}
    />
  );
});
const LegacyAccountItem = observer(function LegacyAccountItem({
  active = false,
  setActive,
}: {
  active: boolean;
  setActive: () => void;
}) {
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
        setActive();
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
            terra3e243r3d94d943di394d49di23d94ij
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});
const AccountContainer = observer(function AccountContainer({
  children,
  isOpen,
  onOpenToggle,
  account,
  title,
  subTitle,
  titleStyles = {},
  subTitleStyles = {},
  active = false,
  setActive,
}: {
  children?: React.ReactNode;
  isOpen: boolean;
  onOpenToggle: (selected: number) => void;
  account: number;
  title: string;
  subTitle: string;
  titleStyles?: StyleProp<TextStyle>;
  subTitleStyles?: StyleProp<TextStyle>;
  active?: boolean;
  setActive: () => void;
  collapsible?: boolean;
}) {
  // const [isOpen, setIsOpen] = useState(false);
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
        onPress={() => {
          setActive && setActive();
        }}
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
          onPress={() => onOpenToggle(account)}
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
const InheritanceAccountItem = observer(function InheritanceAccountItem({
  isOpen = true,
  onOpenToggle,
  account,
  active = false,
  setActive,
}: {
  isOpen: boolean;
  account: number;
  active: boolean;
  onOpenToggle: (item: number) => void;
  setActive: () => void;
}) {
  const inheritancePeriodicity = ["Monthly", "Annually"];
  const [selectedPeriodicity, setSelectedPeriodicity] = useState(
    inheritancePeriodicity[0]
  );
  return (
    <AccountContainer
      isOpen={false}
      onOpenToggle={onOpenToggle}
      account={account}
      title="Inheritor Account"
      subTitle="Inheritance"
      subTitleStyles={{
        color: "white",
      }}
      active={active}
      setActive={setActive}
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
});
const FlexRules = ["Strict", "Limited", "Unlocked"];

const FlexAccountItem = observer(function FlexAccountItem({
  isOpen = true,
  onOpenToggle,
  account,
  active = false,
  setActive,
}: {
  isOpen: boolean;
  account: number;
  active: boolean;
  setActive: () => void;
  onOpenToggle: (item: number) => void;
}) {
  const [amount, setAmount] = useState<number>(10);
  const [timeOpened, setTimeOpened] = useState(false);
  const periodicity = ["Daily", "Weekly", "Monthly", "Yearly"];
  const [selectedPeriod, setSelectedPeriod] = useState(periodicity[0]);
  const [activeFlexRule, setActiveFlexRule] = useState(FlexRules[1]);

  const [debouncedAmount, immediatelyUpdateDebouncedValue] =
    useDebouncedValue<number>(amount, 50);
  if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  const getRuleText = () => {
    switch (activeFlexRule) {
      case "Unlocked":
        return "WARNING: No keys required to sign transactions. This setting will revert after 30:00 minutes or until session expires.";
      case "Strict":
        return "All transactions will require X keys to complete.";
      case "Limited":
        return "Transactions under limit amount only require one key.";
    }
  };

  return (
    <AccountContainer
      isOpen={isOpen}
      onOpenToggle={onOpenToggle}
      account={account}
      title="MyhotWallet"
      subTitle={`${activeFlexRule} Flex Account ${
        activeFlexRule === FlexRules[2] ? ` ⏱ 29:58` : ""
      }`}
      subTitleStyles={{
        color: activeFlexRule === FlexRules[2] ? "#FFE200" : "white",
      }}
      active={active}
      setActive={setActive}
    >
      <ProgessBar amount={70} containerStyle={{ marginVertical: 10 }} />
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
                {FlexRules.map((fr) => (
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
                  opacity: activeFlexRule === FlexRules[1] ? 1 : 0.5,
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
                        editable={activeFlexRule === FlexRules[1]}
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
                        disabled={activeFlexRule !== FlexRules[1]}
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
                    // console.log("slider", value);
                    setAmount(value);
                  }}
                  disabled={activeFlexRule !== FlexRules[1]}
                  value={(debouncedAmount || 0) as number}
                  onSlidingComplete={(value) => {
                    console.log("slider", value);
                  }}
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

const Pill = observer(function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
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

const ProgessBar = observer(function ProgessBar({
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
      style={{
        backgroundColor: "#363636",
        borderRadius: 20,
        height: 10,
        ...(containerStyle ? containerStyle : {}),
      }}
    >
      <View
        style={{
          backgroundColor: "#437DFF",
          height: 10,
          width: `${amount}%`,
          borderRadius: 20,
          ...(barStyle ? barStyle : {}),
        }}
      />
    </View>
  );
});
export * from "./create-account";
