import { faCamera, faPhotoFilm } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { useStore } from "@obi-wallet/common";
import { Text } from "@obi-wallet/common-deprecated";
import { Beneficiary, FlexAccount, SinglesigWallet } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { FC, useState } from "react";
import {
  Image,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import ImagePicker from "react-native-image-crop-picker";
import { SvgProps } from "react-native-svg";

import BeneficiaryAccount from "./assets/beneficiary-account-icon.svg";
import FlexAccountIcon from "./assets/flex-account-icon.svg";
import LegacyAccountIcon from "./assets/legacy-account-icon.svg";
import Pencil from "./assets/pencil.svg";
import { enrichToken } from "../../app/balances";
import { CoinIcon } from "../../app/screens/components/coin-icon";
import { Modal } from "../../app/screens/components/modal";

export interface Icon {
  uri: string;
}

export const AvatarPicker = observer(function AvatarPicker({
  icon,
  onChange,
  FallbackSvg,
}: {
  icon: Icon | null;
  FallbackSvg: FC<SvgProps>;
  onChange: (icon: Icon) => void;
}) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <TouchableOpacity
      style={{
        width: 150,
        height: 150,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "white",
        backgroundColor: "#272727",
        alignItems: "center",
        justifyContent: "center",
        padding: 5,
        position: "relative",
      }}
      onPress={() => {
        setModalVisible(true);
      }}
    >
      {icon ? (
        <>
          <Image
            source={icon}
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              width: "100%",
              height: "100%",
              borderRadius: 16,
              backgroundColor: "blue",
              zIndex: 1,
            }}
          />
          <View
            style={{
              position: "absolute",
              zIndex: 2,
              width: 80,
              height: 80,
              bottom: -30,
              right: -30,
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 3,
              },
              shadowOpacity: 1,
              shadowRadius: 2,
            }}
          >
            <FallbackSvg width="100%" height="100%" />
          </View>
        </>
      ) : (
        <FallbackSvg width="100%" height="100%" />
      )}
      <View
        style={{
          zIndex: 3,
          width: 20,
          height: 20,
          position: "absolute",
          right: 5,
          top: 5,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: 1,
          shadowRadius: 2,
          elevation: 5,
        }}
      >
        <Pencil />
      </View>
      <Modal
        isVisible={modalVisible}
        onClose={() => {
          setModalVisible(false);
        }}
      >
        <Text
          style={{
            textAlign: "center",
            marginBottom: 30,
            color: "white",
            fontSize: 20,
          }}
        >
          Select Photo
        </Text>
        <TouchableOpacity
          style={{
            padding: 10,
            alignItems: "center",
            marginBottom: 20,
            borderColor: "white",
            borderWidth: 1,
            borderRadius: 30,
            flexDirection: "row",
            justifyContent: "center",
          }}
          onPress={async () => {
            try {
              const image = await ImagePicker.openCamera({
                width: 300,
                height: 300,
                cropping: true,
                includeBase64: true,
                mediaType: "photo",
              });
              onChange({
                uri: `data:${image.mime};base64,${image.data}`,
              });
              setModalVisible(false);
            } catch (e) {
              // noop
            }
          }}
        >
          <FontAwesomeIcon
            icon={faCamera}
            color="white"
            style={{ marginRight: 10 }}
          />
          <Text style={{ color: "white" }}>From Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            padding: 10,
            alignItems: "center",
            marginBottom: 20,
            borderColor: "white",
            borderWidth: 1,
            borderRadius: 30,
            flexDirection: "row",
            justifyContent: "center",
          }}
          onPress={async () => {
            try {
              const image = await ImagePicker.openPicker({
                width: 300,
                height: 300,
                cropping: true,
                includeBase64: true,
                mediaType: "photo",
              });
              onChange({
                uri: `data:${image.mime};base64,${image.data}`,
              });
              setModalVisible(false);
            } catch (e) {
              // noop
            }
          }}
        >
          <FontAwesomeIcon
            icon={faPhotoFilm}
            color="white"
            style={{ marginRight: 10 }}
          />
          <Text style={{ color: "white" }}>From Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setModalVisible(false)}
          style={{ alignItems: "center" }}
        >
          <Text style={{ color: "white" }}>Cancel</Text>
        </TouchableOpacity>
      </Modal>
    </TouchableOpacity>
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
            borderRadius: 6,
          },
          style,
        ]}
      >
        {account.meta.icon ? (
          <Image
            source={{ uri: account.meta.icon }}
            style={{ borderRadius: 6, width: "100%", height: "100%" }}
          />
        ) : (
          getDefaultAvatar(account)
        )}
      </View>
    );
  }
});
const getDefaultAvatar = (
  account: Beneficiary | FlexAccount | SinglesigWallet
) => {
  switch (account.type) {
    case "flex-account":
      return <FlexAccountIcon width="100%" height="100%" />;
    case "beneficiary":
      return <BeneficiaryAccount width="100%" height="100%" />;
    case "singlesig-wallet":
      return <LegacyAccountIcon width="100%" height="100%" />;
  }
};

export const SinglesigAvatar = observer<{ style?: StyleProp<ViewStyle> }>(
  function SinglesigAvatar({ style }) {
    const { chainStore } = useStore();
    const formatted = enrichToken({
      chainId: chainStore.currentChainInformation.chainId,
      token: {
        id: chainStore.currentChainInformation.denom,
        rawAmount: "0",
      },
    });

    return (
      <View style={style}>
        <CoinIcon source={formatted?.icon ?? null} />
      </View>
    );
  }
);
