import { KeyType, Text } from "@obi-wallet/common";
import LottieView from "lottie-react-native";
import { observer } from "mobx-react-lite";
import { ComponentType, ReactNode, useEffect } from "react";
import {
  FlatList,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SvgProps } from "react-native-svg";

import Check from "../../../../assets/check.svg";
import Warning from "../../../../assets/warning.svg";
import {
  ComingSoonKeyType,
  useKeyMetaData,
} from "../../../../components/multisig-settings/key-meta-data";
import {
  triggerImpactLight,
  triggerNotificationSuccess,
} from "../../../../helpers/haptic-feedback";
import { useStore } from "../../../stores";

export const CheckIcon = Check;
export const WarningIcon = Warning;

export interface KeyMetaData {
  label: string;
  Icon: ComponentType<SvgProps>;
}

export interface Key {
  type: KeyType | ComingSoonKeyType;
  label?: string;
  description?: string;
  right?: ReactNode;
  signed?: boolean;
  onPress?: () => void;
}

export type HydratedKeyListItem = Key & KeyMetaData;

export interface KeysListProps {
  data: Key[];
  style?: StyleProp<ViewStyle>;
  tiled?: boolean;
}

export const KeysList = observer(function KeysList({
  data,
  style,
  tiled,
}: KeysListProps) {
  const { metaData, comingSoonKeys } = useKeyMetaData();
  const hydratedData = data.map((key) => {
    return {
      ...metaData[key.type],
      ...key,
    };
  });

  return (
    <View style={[style]}>
      <FlatList
        data={[
          ...hydratedData,
          ...comingSoonKeys.map((type) => {
            return {
              ...metaData[type],
              type,
              description: "Coming Soon",
              right: null,
            };
          }),
        ]}
        horizontal={tiled}
        keyExtractor={(item) => item.type}
        renderItem={(props) => <KeyListItem {...props} tiled={tiled} />}
      />
    </View>
  );
});

export interface KeyListItemProps {
  item: HydratedKeyListItem;
  tiled?: boolean;
}

export const KeyListItem = observer(function KeyListItem({
  item,
  tiled,
}: KeyListItemProps) {
  const { label, description, Icon, right, onPress, signed } = item;
  const { configStore } = useStore();
  const isObi = configStore.isObi();
  const isLoop = configStore.isLoop();
  useEffect(() => {
    if (signed) {
      triggerNotificationSuccess();
    }
  }, [signed]);

  if (tiled && item.description === "Coming Soon") return null;

  return tiled ? (
    <TouchableOpacity
      onPress={() => {
        if (onPress) {
          if (!signed) {
            triggerImpactLight();
          }
          onPress();
        }
      }}
    >
      <View style={{ padding: 10, width: 100 }}>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <View
            style={{
              backgroundColor: isObi ? "transparent" : "#1D1C37",
              width: 50,
              height: 50,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 36,
              borderWidth: 5,
              borderColor: signed && isLoop ? "#89F5C2" : "transparent",
            }}
          >
            {signed ? (
              <LottieView
                source={require("./assets/confirm-animation.json")}
                autoPlay
                loop={false}
                style={{ width: 60, zIndex: -1, position: "absolute" }}
              />
            ) : (
              <LottieView
                source={require("./assets/prompt-animation.json")}
                autoPlay
                loop
                style={{ width: 60, zIndex: -1, position: "absolute" }}
              />
            )}
            <Icon fill={isObi ? "#fff" : "#7B87A8"} width={24} height={24} />
          </View>
        </View>
        <Text
          style={{
            color: "#F6F5FF",
            fontSize: 12,
            fontWeight: "600",
            opacity: 0.6,
            marginTop: 4,
            textAlign: "center",
          }}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity
      style={{
        height: 59,
        width: "100%",
        backgroundColor: isLoop ? "#111023" : "#272727",
        marginBottom: 10,
        flexDirection: "row",
        borderRadius: 12,
      }}
      onPress={onPress}
    >
      <View style={{ flex: 2, justifyContent: "center", alignItems: "center" }}>
        <View
          style={{
            backgroundColor: isObi ? "transparent" : "#1D1C37",
            width: 36,
            height: 36,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 12,
          }}
        >
          <Icon fill={isLoop ? "#7B87A8" : "white"} width={24} height={24} />
        </View>
      </View>
      <View style={{ flex: 6, justifyContent: "center" }}>
        <Text
          style={{
            color: "#F6F5FF",
            fontSize: 14,
            fontWeight: "600",
          }}
        >
          {label}
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
      <View style={{ flex: 2, justifyContent: "center", alignItems: "center" }}>
        {right}
      </View>
    </TouchableOpacity>
  );
});
