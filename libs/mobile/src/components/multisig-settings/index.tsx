import { useTheme } from "@emotion/react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet/src";
import { KeyType, MultisigKey, Text } from "@obi-wallet/common";
import { observer } from "mobx-react-lite";
import { ReactNode, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  KeyBottomSheetContent,
  KeyBottomSheetContentProps,
} from "./key-bottom-sheet-content";
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
  children?: ReactNode;
  title: string;
  subTitle: string;
  draftId: string;
  actions: Partial<Record<KeyType, KeyBottomSheetContentProps["action"]>>;
}

export const MultisigSettings = observer<MultisigSettingsProps>(
  function MultisigSettings({ children, draftId, title, subTitle, actions }) {
    const { draftsStore } = useStore();
    const draft = draftsStore.get<MultisigKey>({ id: draftId });

    const multisigKey = draft.value;
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

      return {
        type,
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
          paddingHorizontal: 20,
          flex: 1,
        }}
      >
        <View>
          <Back
            style={{
              marginLeft: -5,
              padding: 5,
              width: 25,
            }}
          />
          <Text style={styles.heading}>{title}</Text>
          <Text style={styles.subHeading}>{subTitle}</Text>
        </View>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <View
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <KeysComponent keys={activatedKeys} />
            <Text
              style={[
                styles.heading,
                {
                  position: "absolute",
                  fontSize: 24,
                },
              ]}
            >
              {multisigKey.threshold}/{activatedKeys}
            </Text>
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
        </View>
        <View style={{ flex: 1, marginTop: 20 }}>
          <KeysList data={data} />
        </View>
        <View>{children}</View>
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
                action={actions[selectedType]}
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
    marginTop: 10,
  },
  subHeading: {
    color: "#999CB6",
    fontSize: isSmallScreenNumber(10, 14),
  },
});
