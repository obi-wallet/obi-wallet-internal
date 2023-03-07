import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  Beneficiary,
  FlexAccount,
  SinglesigWallet,
  Text,
} from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { StyleProp, TextStyle, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";

import { Avatar } from "../../avatar";

export interface AbstractAccountItemProps {
  active: boolean;
  onSetActive: () => Promise<void>;
  isOpen: boolean;
  onOpenToggle: () => void;
  onDelete: () => void;
}

export const AccountContainer = observer<{
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
  account: Beneficiary | FlexAccount | SinglesigWallet;
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
  account,
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
        <Avatar style={{ width: 40, height: 40 }} account={account} />
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
          }}
          hitSlop={{ top: 20, left: 20, right: 20, bottom: 20 }}
        >
          <View
            style={{
              width: 20,
              height: 20,
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

export const Pill = observer<{
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
