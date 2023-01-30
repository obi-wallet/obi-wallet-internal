import { useTheme } from "@emotion/react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet/src";
import {
  KeyType,
  MultisigKey,
  MultisigKeyType,
  Text,
} from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { KeyBottomSheetContent } from "./key-bottom-sheet-content";
import { useKeyMetaData } from "./key-meta-data";
import { Back } from "../../app/screens/components/back";
import {
  CheckIcon,
  Key,
  KeysList,
  WarningIcon,
} from "../../app/screens/components/keys-list";
import { isSmallScreenNumber } from "../../app/screens/components/screen-size";
import { KeysComponent } from "../../app/screens/settings/keys-config/keys-component";
import { useStore } from "../../app/stores";

export interface MultisigSettingsProps {
  multisigKey: MultisigKey;
}

export const MultisigSettings = observer<MultisigSettingsProps>(
  function MultisigSettings({ multisigKey }) {
    const { configStore } = useStore();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [selectedType, setSelectedType] = useState<KeyType | null>(null);
    const theme = useTheme();
    const isLoop = configStore.isLoop();

    const keyMetaData = useKeyMetaData();

    const triggerBottomSheet = (index: number) => {
      if (index === -1) {
        bottomSheetRef.current?.close();
      } else {
        bottomSheetRef.current?.snapToIndex(index);
      }
    };

    function getKey(
      type: KeyType
    ): Key & { activated: boolean; disabled: boolean } {
      const activated = multisigKey.hasKeyOfType(type);
      const disabled = false;

      const metaData = keyMetaData.metaData[type];

      const id = ((): MultisigKeyType => {
        switch (type) {
          case KeyType.Device:
            return "biometrics";
          case KeyType.Phone:
            return "phoneNumber";
          case KeyType.Social:
            return "social";
        }
      })();

      return {
        id,
        title: metaData.label,
        activated,
        disabled,
        right: activated ? <CheckIcon /> : <WarningIcon />,
        onPress: () => {
          triggerBottomSheet(0);
          setSelectedType(type);
        },
      };
    }

    const data = keyMetaData.keys.map(getKey);
    const activatedKeys = multisigKey.keys.length;

    return (
      <SafeAreaView
        style={{
          backgroundColor: theme.colors.background,
          flex: 1,
          paddingHorizontal: 16,
          paddingTop: 20,
        }}
      >
        <View style={{ flex: 2 }}>
          <Back style={{ alignSelf: "flex-start" }} />
          <Text style={styles.heading}>
            <FormattedMessage
              id="settings.multisig.title"
              defaultMessage="Manage Multisig"
            />
          </Text>
          <Text style={styles.subHeading}>
            <FormattedMessage
              id="settings.multisig.subtitle"
              defaultMessage="Add/edit keys to improve security. Tap on any of the following"
            />
          </Text>
        </View>
        <View
          style={{ flex: 3, justifyContent: "center", alignItems: "center" }}
        >
          <View>
            <KeysComponent keys={activatedKeys} />
          </View>
          <Text
            style={[
              styles.heading,
              {
                marginTop: 0,
                fontSize: isSmallScreenNumber(14, 18),
                marginBottom: 8,
              },
            ]}
          >
            <FormattedMessage
              id="settings.multisig.risk.high"
              defaultMessage="Security Tier: Basic"
            />
          </Text>
          <Text
            style={[
              styles.heading,
              {
                marginTop: 0,
                fontSize: isSmallScreenNumber(14, 18),
                marginBottom: 8,
              },
            ]}
          >
            {/* TODO: Design */}
            Threshold: {multisigKey.threshold}
          </Text>
        </View>
        <View style={{ flex: 6 }}>
          <View style={{ marginTop: 40, flex: 1 }}>
            <KeysList data={data} />
          </View>
        </View>
        <BottomSheet
          handleIndicatorStyle={{ backgroundColor: "white" }}
          backgroundStyle={{ backgroundColor: isLoop ? "#100F1E" : "#272727" }}
          handleStyle={{ backgroundColor: "transparent" }}
          snapPoints={["50%"]}
          enablePanDownToClose={true}
          ref={bottomSheetRef}
          index={-1}
        >
          <BottomSheetView
            style={{
              flex: 1,
              backgroundColor: "transparent",
              position: "relative",
            }}
          >
            {selectedType ? (
              <KeyBottomSheetContent
                type={selectedType}
                multisigKey={multisigKey}
                onClose={() => {
                  triggerBottomSheet(-1);
                }}
              />
            ) : null}
          </BottomSheetView>
        </BottomSheet>
      </SafeAreaView>
    );
  }
);

const styles = StyleSheet.create({
  heading: {
    color: "#F6F5FF",
    fontSize: isSmallScreenNumber(18, 24),
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 30,
  },
  subHeading: {
    color: "#999CB6",
    fontSize: isSmallScreenNumber(10, 14),
    marginBottom: 31,
  },
});
