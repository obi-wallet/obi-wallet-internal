import {
  faChevronDown,
  faChevronUp,
  faPlus,
  faCaretUp,
  faCaretDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { FormattedMessage } from "react-intl";
import {
  FlatList,
  ImageBackground,
  LayoutAnimation,
  Platform,
  UIManager,
  View,
  ViewStyle,
} from "react-native";
import { TouchableOpacity, TextInput } from "react-native";
import { Animated } from "react-native";
import KeyRoundIcon from "./assets/key-round-icon.svg";
import RecoveryIcon from "./assets/recovery-icon.svg";
import SpendingIcon from "./assets/spending-icon.svg";
import InheritanceIcon from "./assets/inheritance-icon.svg";
import { UsdBalance } from "../../balances";
import { useStore } from "../../stores";
import { Background } from "../components/background";
import { NetworkAccountPickerLayout } from "../components/network-account-picker-layout";
import { Style } from "util";
import { Button } from "../../button";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ToggleSwitch } from "../components/toggle-switch";
import { SvgProps } from "react-native-svg";
import Slider from "@react-native-community/slider";
import * as Animatable from "react-native-animatable";
import { useDebouncedValue } from "rooks";
import { values } from "ramda";

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
          <TouchableOpacity style={{ position: "absolute", top: 0, left: 0 }}>
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

const AccountsList = () => {
  const [itemOpened, setItemOpened] = useState<number | null>(null);
  console.log({ itemOpened });
  return (
    <FlatList
      data={[1, 2]}
      renderItem={(element) => {
        return (
          <AccountItem
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
          />
        );
      }}
      keyExtractor={(item) => item.toString()}
    />
  );
};

const AccountItem = ({
  isOpen = true,
  onOpenToggle,
  account,
}: {
  isOpen: boolean;
  account: number;
  onOpenToggle: (item: number) => void;
}) => {
  const [isOn, setIsOn] = useState(true);
  const [amount, setAmount] = useState<Number>(10);
  const [timeOpened, setTimeOpened] = useState(false);
  const periodicity = ["Daily", "Weekly", "Monthly", "Yearly"];
  const [selectedPeriod, setSelectedPeriod] = useState(periodicity[0]);

  const [debouncedAmount, immediatelyUpdateDebouncedValue] =
    useDebouncedValue<Number>(amount, 50);
  if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  return (
    <Animatable.View
      duration={400}
      style={{
        borderWidth: 1,
        borderRadius: 7,
        borderColor: "white",
        marginVertical: 10,
        padding: 10,
      }}
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
            MyhotWallet
          </Text>
          <Text
            style={{
              color: "white",
              fontSize: 12,
            }}
          >
            parent account panterra0x
          </Text>
        </View>
      </View>
      <View
        style={{
          position: "absolute",
          width: 20,
          aspectRatio: 1 / 1,
          backgroundColor: "white",
          right: 5,
          top: 5,
          borderRadius: 100,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity onPress={() => onOpenToggle(account)}>
          <FontAwesomeIcon icon={isOpen ? faCaretUp : faCaretDown} />
        </TouchableOpacity>
      </View>
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
              <Text style={{ color: "#fff", margin: 5, fontSize: 12 }}>
                Flex Rules
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  flex: 1,
                  justifyContent: "space-around",
                }}
              >
                <Pill label="Strict" />
                <Pill label="Limited" active />
                <Pill label="Unlocked" />
              </View>
              <View style={{ padding: 10 }}>
                <Text style={{ color: "#fff", fontSize: 12 }}>
                  Transactions under limit amount only require one key.
                </Text>
              </View>
              <View style={{ alignItems: "center" }}>
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
                        }}
                        value={`$${amount}`}
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
                  value={debouncedAmount || 0}
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
    </Animatable.View>
  );
};

const Pill = ({ label, active }: { label: string; active?: boolean }) => {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: active ? "#437DFF" : "transparent",
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
      }}
    >
      <Text style={{ color: "#fff", fontSize: 12 }}>{label}</Text>
    </TouchableOpacity>
  );
};

const FeatureItem = ({
  Icon,
  label,
}: {
  Icon: React.FC<SvgProps>;
  label: string;
}) => {
  return (
    <TouchableOpacity>
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "#437DFF",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 4,
            width: 45,
            aspectRatio: 1 / 1,
          }}
        >
          <Icon />
        </View>
      </View>
      <View style={{ alignItems: "center" }}>
        <Text style={{ color: "white" }}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const ProgessBar = ({
  amount,
  containerStyle,
  barStyle,
}: {
  amount: number;
  containerStyle?: ViewStyle;
  barStyle?: ViewStyle;
}) => {
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
};
export * from "./create-account";
