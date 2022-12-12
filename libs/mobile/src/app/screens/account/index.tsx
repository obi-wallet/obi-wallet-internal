import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet/src";
import { Text } from "@obi-wallet/common";
import { ComponentType, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import { FlatList, Image, ImageBackground, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgProps } from "react-native-svg";

import { UsdBalance } from "../../balances";
import { useRootNavigation } from "../../root-stack";
import { Background } from "../components/background";
import { BottomSheetBackdrop } from "../components/bottomSheetBackdrop";
import { NetworkAccountPickerLayout } from "../components/network-account-picker-layout";
import InheritanceIcon from "./assets/inheritanceIcon.svg";
import SpendingIcon from "./assets/spendingIcon.svg";
import { Inheritance } from "./inheritance";
import { Spending } from "./spending";

export function AccountScreen() {
  return (
    <>
      <Background />
      <NetworkAccountPickerLayout>
        <AccountScreenInner />
      </NetworkAccountPickerLayout>
    </>
  );
}

export function AccountScreenInner() {
  const safeArea = useSafeAreaInsets();
  const navigation = useRootNavigation();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [selectedMenu, setSelectedMenu] = useState("");

  const triggerBottomSheet = (selection?: Option) => {
    if (selection) {
      setSelectedMenu(selection.name);
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  };
  const renderSelectionContent = () => {
    switch (selectedMenu) {
      case "spending":
        return <Spending />;
      case "inheritance":
        return <Inheritance />;
      default:
        return null;
    }
  };

  return (
    <View style={{ paddingHorizontal: 20 }}>
      <View
        style={{
          backgroundColor: "#1C0C3F",
          borderRadius: 16,
        }}
      >
        <ImageBackground
          source={require("./assets/accountbg.png")}
          style={{ padding: 20 }}
          resizeMode="cover"
          borderRadius={16}
        >
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

      {/*<View*/}
      {/*  style={{*/}
      {/*    backgroundColor: "#16152D",*/}
      {/*    marginTop: 34,*/}
      {/*    borderRadius: 12,*/}
      {/*    padding: 20,*/}
      {/*  }}*/}
      {/*>*/}
      {/*  <View style={{ flexDirection: "row" }}>*/}
      {/*    <Image*/}
      {/*      source={require("./assets/avatars/avatars-3.png")}*/}
      {/*      style={{ height: 42, width: 42, borderRadius: 42 }}*/}
      {/*    />*/}
      {/*    <View*/}
      {/*      style={{ paddingLeft: 15, flex: 1, justifyContent: "space-around" }}*/}
      {/*    >*/}
      {/*      <View*/}
      {/*        style={{ flexDirection: "row", justifyContent: "space-between" }}*/}
      {/*      >*/}
      {/*        <Text*/}
      {/*          style={{ color: "#F6F5FF", fontSize: 14, fontWeight: "500" }}*/}
      {/*        >*/}
      {/*          $4,582*/}
      {/*        </Text>*/}
      {/*        <FontAwesomeIcon*/}
      {/*          icon={faCheckCircle}*/}
      {/*          style={{ width: 16, height: 16, color: "#7AD6AE" }}*/}
      {/*        />*/}
      {/*      </View>*/}
      {/*      <Text*/}
      {/*        style={{*/}
      {/*          color: "rgba(246, 245, 255, 0.6);",*/}
      {/*          fontSize: 12,*/}
      {/*          fontWeight: "400",*/}
      {/*        }}*/}
      {/*      >*/}
      {/*        dungeon_master*/}
      {/*      </Text>*/}
      {/*    </View>*/}
      {/*  </View>*/}
      {/*  <View>*/}
      {/*    <View*/}
      {/*      style={{*/}
      {/*        height: 6,*/}
      {/*        backgroundColor: "#1E1D3A",*/}
      {/*        borderRadius: 4,*/}
      {/*        marginTop: 20,*/}
      {/*        marginBottom: 8,*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      <LinearGradient*/}
      {/*        start={{ x: 0, y: 0 }}*/}
      {/*        end={{ x: 1, y: 0 }}*/}
      {/*        colors={["#FCCFF7", "#E659D6", "#8877EA", "#86E2EE"]}*/}
      {/*        style={{ flex: 1, width: "60%", borderRadius: 4 }}*/}
      {/*      />*/}
      {/*    </View>*/}
      {/*    <View*/}
      {/*      style={{ justifyContent: "space-between", flexDirection: "row" }}*/}
      {/*    >*/}
      {/*      <Text*/}
      {/*        style={{*/}
      {/*          fontSize: 11,*/}
      {/*          fontWeight: "400",*/}
      {/*          color: "rgba(246, 245, 255, 0.6);",*/}
      {/*        }}*/}
      {/*      >*/}
      {/*        Daily Balance*/}
      {/*      </Text>*/}
      {/*      <View style={{ flexDirection: "row" }}>*/}
      {/*        <Text*/}
      {/*          style={{ fontSize: 11, fontWeight: "400", color: "#f6f5ff" }}*/}
      {/*        >*/}
      {/*          $80*/}
      {/*        </Text>*/}
      {/*        <Text*/}
      {/*          style={{*/}
      {/*            fontSize: 11,*/}
      {/*            fontWeight: "400",*/}
      {/*            color: "#f6f5ff",*/}
      {/*            opacity: 0.6,*/}
      {/*          }}*/}
      {/*        >*/}
      {/*          /100*/}
      {/*        </Text>*/}
      {/*      </View>*/}
      {/*    </View>*/}
      {/*    <View>*/}
      {/*      <FlatList*/}
      {/*        data={options}*/}
      {/*        horizontal*/}
      {/*        renderItem={(props) => (*/}
      {/*          <Option*/}
      {/*            item={props.item}*/}
      {/*            onPress={() => triggerBottomSheet(props.item)}*/}
      {/*          />*/}
      {/*        )}*/}
      {/*        style={{ marginTop: 20 }}*/}
      {/*      />*/}
      {/*    </View>*/}
      {/*  </View>*/}
      {/*</View>*/}

      <View
        style={{
          flex: 3,
          justifyContent: "flex-end",
          paddingBottom: 20,
          marginBottom: safeArea.bottom / 2,
          marginTop: 10,
        }}
      >
        <FlatList
          data={
            [
              // { key: "1", amount: 231, name: "My_personal_wallet" },
              // { key: "2", amount: 8293, name: "Hot_wallet" },
              // { key: "3", amount: 8293, name: "Captain_Private" },
              // { key: "4", amount: 8293, name: "other_one" },
            ]
          }
          renderItem={({ item }) => {
            return null;

            // const images = [
            //   require("./assets/avatars/avatars-1.png"),
            //   require("./assets/avatars/avatars-2.png"),
            //   require("./assets/avatars/avatars-3.png"),
            //   require("./assets/avatars/avatars-4.png"),
            // ];
            //
            // return (
            //   <View
            //     style={{
            //       backgroundColor: "#0F0E20",
            //       borderRadius: 12,
            //       marginVertical: 10,
            //       flexDirection: "row",
            //       padding: 20,
            //       flex: 1,
            //     }}
            //   >
            //     <Image
            //       source={images[Number(item.key) - 1]}
            //       style={{ height: 42, width: 42, borderRadius: 42 }}
            //     />
            //     <View style={{ paddingLeft: 10, flex: 1 }}>
            //       <Text
            //         style={{
            //           fontSize: 14,
            //           fontWeight: "400",
            //           color: "#f6f5ff",
            //         }}
            //       >
            //         {item.amount}
            //       </Text>
            //       <Text
            //         style={{
            //           fontSize: 12,
            //           fontWeight: "400",
            //           color: "rgba(246, 245, 255, 0.6);",
            //         }}
            //       >
            //         {item.name}
            //       </Text>
            //     </View>
            //     <View style={{ justifyContent: "center" }}>
            //       <View
            //         style={{
            //           width: 16,
            //           height: 16,
            //           borderColor: "rgba(255,255,255,.4)",
            //           borderWidth: 1,
            //           borderRadius: 16,
            //         }}
            //       ></View>
            //     </View>
            //   </View>
            // );
          }}
        />
      </View>
      <BottomSheetBackdrop
        onPress={() => triggerBottomSheet()}
        visible={Boolean(selectedMenu)}
      />
      <BottomSheet
        handleIndicatorStyle={{ backgroundColor: "white" }}
        backgroundStyle={{ backgroundColor: "#100F1E" }}
        handleStyle={{ backgroundColor: "transparent" }}
        snapPoints={selectedMenu === "inheritance" ? ["70%"] : ["40"]}
        enablePanDownToClose={true}
        ref={bottomSheetRef}
        index={-1}
        backdropComponent={(props) => null}
        onClose={() => setSelectedMenu("")}
      >
        <BottomSheetView
          style={{
            flex: 1,
            backgroundColor: "transparent",
            position: "relative",
          }}
        >
          {renderSelectionContent()}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

interface Option {
  key: number;
  name: string;
  Icon: ComponentType<SvgProps>;
}

const options: Option[] = [
  {
    key: 0,
    name: "spending",
    Icon: SpendingIcon,
  },
  {
    key: 1,
    name: "inheritance",
    Icon: InheritanceIcon,
  },
];

interface OptionProps {
  item: Option;
  onPress: () => void;
}

function Option({ item, onPress }: OptionProps) {
  return (
    <TouchableOpacity
      style={{ height: 60, justifyContent: "center", alignItems: "center" }}
      onPress={onPress}
    >
      <>
        <item.Icon
          style={{
            width: 40,
            height: 40,

            marginHorizontal: 10,
            marginBottom: 10,
          }}
        />
        <Text style={{ fontSize: 12, color: "white", opacity: 0.6 }}>
          {item.name}
        </Text>
      </>
    </TouchableOpacity>
  );
}
