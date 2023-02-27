import {
  faCaretDown,
  faCaretUp,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  GatekeeperConfig,
  EntityId,
  Text,
  TextInput,
  Beneficiary,
  FlexAccount,
  SinglesigWallet,
} from "@obi-wallet/common";
import Slider from "@react-native-community/slider";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { observer } from "mobx-react-lite";
import { FC, useState } from "react";
import { FormattedMessage } from "react-intl";
import {
  FlatList,
  ImageBackground,
  LayoutAnimation,
  Platform,
  TouchableOpacity,
  UIManager,
  View,
  ViewStyle,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { SvgProps } from "react-native-svg";
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

const AccountsList = observer(function AccountsList() {
  const { draftsStore } = useStore();
  const wallet = useMultisigWallet();

  const draftId = getGatekeeperConfigDraftId(wallet);
  const draft = draftsStore.get<GatekeeperConfig>({
    id: draftId,
  });

  const accounts = wallet.getAccounts(draft.value);
  const [itemOpened, setItemOpened] = useState<EntityId | null>(null);

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
            account={element.item.account}
          />
        );
      }}
      keyExtractor={(item) => item.id}
    />
  );
});

const AccountItem = observer(function AccountItem({
  isOpen,
  onOpenToggle,
  account,
}: {
  isOpen: boolean;
  account: Beneficiary | FlexAccount | SinglesigWallet;
  onOpenToggle: () => void;
}) {
  const [isOn, setIsOn] = useState(true);
  const [amount, setAmount] = useState(10);
  const [timeOpened, setTimeOpened] = useState(false);
  const periodicity = ["Daily", "Weekly", "Monthly", "Yearly"];
  const [selectedPeriod, setSelectedPeriod] = useState(periodicity[0]);

  const [debouncedAmount, immediatelyUpdateDebouncedValue] = useDebouncedValue(
    amount,
    50
  );

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
        <TouchableOpacity onPress={onOpenToggle}>
          <FontAwesomeIcon icon={isOpen ? faCaretUp : faCaretDown} />
        </TouchableOpacity>
      </View>
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
                    setAmount(value);
                  }}
                  value={debouncedAmount || 0}
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
});

const Pill = observer(function Pill({
  label,
  active,
}: {
  label: string;
  active?: boolean;
}) {
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
});

const FeatureItem = observer(function FeatureItem({
  Icon,
  label,
}: {
  Icon: FC<SvgProps>;
  label: string;
}) {
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
