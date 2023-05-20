import { faInfoCircle } from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { KeyType, MultisigKey } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { FormattedMessage } from "react-intl";
import { TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useKeyMetaData } from "./key-meta-data";
import { useStore } from "../../contexts";
import { Text } from "../typography";

export interface KeyBottomSheetContentProps {
  type: KeyType;
  multisigKey: MultisigKey;

  action?: {
    label: string;
    onPress(): void;
  };
  onClose(): void;
}

export const KeyBottomSheetContent = observer<KeyBottomSheetContentProps>(
  function KeyBottomSheetContent({ type, multisigKey, action, onClose }) {
    const keyMetaData = useKeyMetaData();

    const { label, Icon } = keyMetaData.metaData[type];
    const title = label;
    const activated = multisigKey.hasKeyOfType(type);

    const { configStore } = useStore();
    const isLoop = configStore.isLoop();
    const isObi = configStore.isObi();

    const safeArea = useSafeAreaInsets();

    const getRecoverButton = () => {
      if (!action) return null;

      return (
        <TouchableOpacity
          onPress={() => {
            action.onPress();
            onClose();
          }}
          style={{
            paddingVertical: 5,
            width: "100%",
            backgroundColor: isLoop ? "#59D6E6" : "#437DFF",
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "700",
              ...(isObi ? { color: "white" } : {}),
            }}
          >
            {action.label}
          </Text>
        </TouchableOpacity>
      );
    };

    const getModalText = (keyId: KeyType) => {
      switch (keyId) {
        case KeyType.Phone:
          return (
            <FormattedMessage
              id="settings.multisig.modal.phone.text"
              defaultMessage="This key can authorize messages via SMS or WhatsApp messages sent directly to your phone number."
            />
          );
        case KeyType.Device:
          return (
            <FormattedMessage
              id="settings.multisig.modal.biometrics.text"
              defaultMessage="This key is held on your device, in a secure element or secure keychain."
            />
          );
        case KeyType.Social:
          return (
            <FormattedMessage
              id="settings.multisig.modal.social.text"
              defaultMessage="This key belongs to a trusted contact or to Obi and can help you recover your account. It cannot access your account on its own."
            />
          );
        case KeyType.Email:
          return (
            <FormattedMessage
              id="settings.multisig.modal.email.text"
              defaultMessage="This key is kept in an email account for one-time recovery use. Future versions will use seamless zero-knowledge email recovery."
            />
          );
        default:
          return null;
      }
    };

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          paddingBottom: safeArea.bottom,
          paddingHorizontal: 20,
          marginTop: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{
              padding: 10,
              backgroundColor: isLoop ? "#1D1C37" : "#437DFF",
              alignSelf: "flex-start",
              borderRadius: 12,
            }}
          >
            <Icon fill={isLoop ? "#7B87A8" : "white"} width={24} height={24} />
          </View>
          <View
            style={{
              padding: 10,
              backgroundColor: isLoop
                ? "#1D1C37"
                : activated
                ? "#437DFF"
                : "#1a1a1a",
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                color: isLoop ? (activated ? "#89F5C2" : "#999CB6") : "white",
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              {activated && (
                <FormattedMessage id="general.active" defaultMessage="Active" />
              )}
              {!activated && (
                <FormattedMessage
                  id="general.notactive"
                  defaultMessage="Not Active"
                />
              )}
            </Text>
          </View>
        </View>
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#f6f5ff",
              marginBottom: 10,
            }}
          >
            {title}
          </Text>
          <Text style={{ color: "rgba(246, 245, 255, 0.6)" }}>
            {getModalText(type)}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {type !== KeyType.Device ? (
            <>
              <FontAwesomeIcon
                icon={faInfoCircle}
                style={{ color: "rgba(246, 245, 255, 0.6)", marginRight: 10 }}
              />
              <Text
                style={{
                  flex: 1,
                  fontSize: 12,
                  color: "rgba(246, 245, 255, 0.6)",
                }}
              >
                <FormattedMessage
                  id="settings.multisig.modal.info"
                  defaultMessage="In case this key is stolen/lost or for any other reason, you can replace it with a new one."
                />
              </Text>
            </>
          ) : null}
        </View>
        <View style={{ alignItems: "center" }}>
          {getRecoverButton()}
          <TouchableOpacity
            onPress={() => onClose()}
            style={{ paddingVertical: 15, paddingHorizontal: 63 }}
          >
            <Text style={{ color: "#787B9C" }}>
              <FormattedMessage
                id="settings.multisig.modal.close"
                defaultMessage="Close"
              />
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);
