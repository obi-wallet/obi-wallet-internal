import { useTheme } from "@emotion/react";
import { KeyType } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import {
  ComponentType,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  FlatList,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { SvgProps } from "react-native-svg";

import { ComingSoonKeyType, useKeyMetaData } from "./key-meta-data";
import { useStore } from "../../contexts/stores";
import { triggerImpactLight, triggerNotificationSuccess } from "../../helpers";
import {
  ConfirmAnimation,
  LoadingAnimation,
  PromptAnimation,
} from "../animations";
import { Text } from "../typography";

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
  animate?: boolean;
  hideOtherKeys?: boolean;
}

export const KeysList = observer(function KeysList({
  data,
  style,
  tiled,
  animate,
  hideOtherKeys,
}: KeysListProps) {
  const { unityStore } = useStore();
  const { metaData, comingSoonKeys } = useKeyMetaData();
  const hydratedData = data.map((key) => {
    return {
      ...metaData[key.type],
      ...key,
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function getKeyDescription(key: any) {
    if (key?.type === KeyType.Device && unityStore.currentDeviceId) {
      return "Browser only";
    }

    if (key?.type === KeyType.Unity && !unityStore.currentDeviceId) {
      return "Unity only";
    }

    return key.description;
  }

  return (
    <View style={[{ flex: 1 }, style]}>
      <FlatList
        data={[
          ...hydratedData.map((key) => ({
            ...key,
            description: getKeyDescription(key),
            right: getKeyDescription(key) ? null : key.right,
          })),
          ...comingSoonKeys.map((type) => {
            return {
              ...metaData[type],
              type,
              description: "Coming Soon",
              right: null,
            };
          }),
        ].filter((key) => {
          if (hideOtherKeys) {
            return data.find((k) => key.type === k.type);
          }
          return true;
        })}
        horizontal={tiled}
        keyExtractor={(item) => item.type}
        renderItem={(props) => (
          <KeyListItem {...props} tiled={tiled} animate={animate} />
        )}
      />
    </View>
  );
});

export interface KeyListItemProps {
  item: HydratedKeyListItem;
  tiled?: boolean;
  animate?: boolean;
}

export const KeyListItem = observer(function KeyListItem({
  item,
  tiled,
  animate,
}: KeyListItemProps) {
  const { label, description, Icon, right, onPress, signed } = item;
  const theme = useTheme();

  const [pending, setPending] = useState(false);
  useEffect(() => {
    if (signed) {
      triggerNotificationSuccess();
    }
  }, [signed]);
  const onPressSingleton = useCallback(async () => {
    if (onPress) {
      setPending(true);
      try {
        await onPress();
      } finally {
        setPending(false);
      }
    }
  }, [onPress]);

  if (tiled && item.description === "Coming Soon") return null;
  const renderContent = () => {
    if (pending) {
      return (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#111",
            padding: 25,
            borderRadius: 100,
          }}
        >
          <LoadingAnimation />
        </View>
      );
    }

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
        }}
      >
        {signed ? <ConfirmAnimation /> : <PromptAnimation loop={animate} />}
        <Icon
          fill="#fff"
          width={24}
          height={24}
          // hacky center device key svg
          style={label === "Device Key" ? { marginTop: 2, marginLeft: 2 } : {}}
        />
      </View>
    );
  };

  return tiled ? (
    <TouchableOpacity
      onPress={async () => {
        if (onPress && !pending) {
          if (!signed) {
            triggerImpactLight();
            await onPressSingleton();
          }
        }
      }}
    >
      <View style={{ padding: 10, width: 100 }}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 60,
              height: 60,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 60,
              borderWidth: 5,
              borderColor: "transparent",
            }}
          >
            {renderContent()}
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
      style={[
        {
          height: 59,
          width: "100%",
          backgroundColor: theme.colors.panelBackground,
          marginBottom: 10,
          flexDirection: "row",
          borderRadius: 12,
          justifyContent: "space-between",
        },
        theme.settings?.panelContainer,
      ]}
      onPress={onPress}
    >
      <View style={{ flexDirection: "row" }}>
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <View
            style={{
              width: 24,
              height: 24,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 12,
            }}
          >
            <Icon fill="#ffffff" width={24} height={24} />
          </View>
        </View>
        <View style={{ justifyContent: "center" }}>
          <Text
            style={{
              color: "#F6F8FC",
              fontSize: 14,
              fontWeight: "600",
              marginLeft: 24,
            }}
          >
            {label.toUpperCase()}
          </Text>
          {description ? (
            <Text
              style={{
                color: "#F6F5FF",
                fontSize: 12,
                opacity: 0.6,
                marginTop: 4,
                marginLeft: 24,
              }}
            >
              {description}
            </Text>
          ) : null}
        </View>
      </View>
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        {right}
      </View>
    </TouchableOpacity>
  );
});
