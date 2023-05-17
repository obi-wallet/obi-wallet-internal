import {
  faChevronDown,
  faChevronUp,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { Beneficiary, FlexAccount, SinglesigWallet } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { StyleProp, TextStyle, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";

import { Avatar } from "../../avatar";

export interface AbstractAccountItemProps {
  isOpen: boolean;
  onOpenToggle: () => void;
  active: boolean;
  onSetActive: () => void;
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
  onDelete: () => void;
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
  onDelete,
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
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <TouchableOpacity
          style={{ flexDirection: "row", flex: 1 }}
          onPress={onSetActive}
          disabled={active}
        >
          <Avatar style={{ width: 40, height: 40 }} account={account} />
          <View style={{ paddingLeft: 10, flexShrink: 1 }}>
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
        <TouchableOpacity style={{ padding: 10 }} onPress={onDelete}>
          <FontAwesomeIcon icon={faTrash} color="#fff" />
        </TouchableOpacity>
      </View>

      {children && (
        <>
          {children}
          <TouchableOpacity onPress={onOpenToggle}>
            <View
              style={{
                justifyContent: "center",
                alignItems: "center",
                paddingTop: 10,
              }}
            >
              <FontAwesomeIcon
                icon={isOpen ? faChevronUp : faChevronDown}
                color="#4E4E4E"
              />
            </View>
          </TouchableOpacity>
        </>
      )}
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
      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});
