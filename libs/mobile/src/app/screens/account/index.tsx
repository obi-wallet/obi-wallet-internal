import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { FormattedMessage } from "react-intl";
import { FlatList, ImageBackground, View, ViewStyle } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgProps } from "react-native-svg";

// import InheritanceIcon from "./assets/inheritanceIcon.svg";
// import SpendingIcon from "./assets/spendingIcon.svg";
import KeyRoundIcon from "./assets/key-round-icon.svg";
import RecoveryIcon from "./assets/recovery-icon.svg";
import SpendingIcon from "./assets/spending-icon.svg";
import InheritanceIcon from "./assets/inheritance-icon.svg";
import { Inheritance } from "./inheritance";
import { Spending } from "./spending";
import { UsdBalance } from "../../balances";
import { useMultisigWallet, useStore } from "../../stores";
import { Background } from "../components/background";
import { BottomSheetBackdrop } from "../components/bottomSheetBackdrop";
import { NetworkAccountPickerLayout } from "../components/network-account-picker-layout";
import { Style } from "util";
import { Button } from "../../button";
import { TextInput } from "../../text-input";

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
  const wallet = useMultisigWallet();
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
  return (
    <FlatList
      data={[1, 2]}
      renderItem={AccountItem}
      keyExtractor={(item) => item.toString()}
    />
  );
};

const AccountItem = () => {
  return (
    <View
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
              fontFamily: "Poppins-Light",
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
        }}
      />
      <ProgessBar amount={70} containerStyle={{ marginVertical: 10 }} />
      <View style={{ justifyContent: "space-around", flexDirection: "row" }}>
        <FeatureItem Icon={SpendingIcon} label="Spending" />
        <FeatureItem Icon={RecoveryIcon} label="Recovery" />
        <FeatureItem Icon={InheritanceIcon} label="Inheritance" />
      </View>
      <View
        style={{ backgroundColor: "#363636", borderRadius: 7, marginTop: 10 }}
      >
        <View style={{ height: 20, backgroundColor: "red", width: 40 }} />
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 10,
          }}
        >
          <Text style={{ color: "white", fontSize: 12 }}>
            Set spending limit:
          </Text>
          <TextInput style={{ width: 80 }} />
          <TextInput style={{ width: 80 }} />
        </View>
        <View style={{ margin: 15 }}>
          <Button flavor="blue" label="Confirm" />
        </View>
      </View>
    </View>
  );
};

const FeatureItem = ({ Icon, label }) => {
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
        <Text style={{ color: "white", fontFamily: "Poppis-Light" }}>
          {label}
        </Text>
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
