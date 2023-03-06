import { Beneficiary, FlexAccount, SinglesigWallet } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { StyleProp, TouchableOpacity, ViewStyle } from "react-native";
import { Image, View } from "react-native";

import Pencil from "./assets/pencil.svg";
import { formatCoin } from "../../app/balances";
import { CoinIcon } from "../../app/screens/components/coin-icon";
import { useCurrentTerraChainInformation } from "../../app/stores";

export const AvatarPicker = observer(function AvatarPicker() {
  return (
    <View
      style={{
        width: 95,
        height: 95,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "white",
        backgroundColor: "#272727",
      }}
    >
      <Image
        source={require("./assets/fire.png")}
        style={{ maxHeight: "100%", maxWidth: "100%" }}
      />
      <TouchableOpacity
        style={{
          width: 20,
          height: 20,
          position: "absolute",
          right: 5,
          top: 5,
        }}
      >
        <Pencil />
      </TouchableOpacity>
    </View>
  );
});

export const Avatar = observer<{
  style?: StyleProp<ViewStyle>;
  account: Beneficiary | FlexAccount | SinglesigWallet;
}>(function Avatar({ style, account }) {
  if (account.type === "singlesig-wallet") {
    return <SinglesigAvatar style={style} />;
  } else {
    return (
      <View
        style={[
          {
            backgroundColor: "white",
            borderRadius: 6,
          },
          style,
        ]}
      />
    );
  }
});

export const SinglesigAvatar = observer<{ style?: StyleProp<ViewStyle> }>(
  function SinglesigAvatar({ style }) {
    const currentTerraChainInformation = useCurrentTerraChainInformation();
    const formatted = formatCoin({
      denom: currentTerraChainInformation.denom,
      amount: "0",
    });

    return (
      <View style={style}>
        <CoinIcon source={formatted?.icon ?? null} />
      </View>
    );
  }
);
