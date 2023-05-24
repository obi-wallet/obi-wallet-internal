import { faQrcode } from "@fortawesome/free-solid-svg-icons/faQrcode";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { ChainId, Sdk } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { ControllerFieldState } from "react-hook-form";
import { TouchableOpacity, View } from "react-native";

import {
  SendIcon,
  TextInput,
  TextInputInvalidMessage,
  useQrCodeScannerModal,
} from "../../components";
import { useStore } from "../../contexts";
import { isSmallScreenNumber } from "../../helpers";

// TODO:
const ObiQr = SendIcon;

export interface AddressControllerProps {
  chainId: ChainId;
  field: {
    onChange: (value: string) => void;
    onBlur: () => void;
    value: string;
  };
  fieldState: ControllerFieldState;
  label: string;
  placeholder: string;
}

export const AddressController = observer<AddressControllerProps>(
  function AddressController({
    chainId,
    label,
    placeholder,
    field,
    fieldState,
  }) {
    const { configStore } = useStore();
    const isObi = configStore.isObi();
    const isLoop = configStore.isLoop();

    const hasError = fieldState.error !== undefined;

    const qrCodeScannerModal = useQrCodeScannerModal(({ data, close }) => {
      if (Sdk.chainId(chainId).transactions.validateAddress(data)) {
        field.onChange(data);
        close();
      }
    });

    return (
      <>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
          }}
        >
          <TextInput
            label={label}
            placeholder={placeholder}
            style={{ flex: 1 }}
            inputStyle={[
              {
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderRightWidth: 0,
              },
              hasError
                ? {
                    borderColor: "#FF2222",
                  }
                : null,
            ]}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
          <TouchableOpacity
            style={[
              {
                width: 56,
                height: isSmallScreenNumber(46, 56),
                justifyContent: "center",
                alignItems: "center",
                padding: isObi ? 0 : 5,
                borderTopRightRadius: isObi ? 32 : 12,
                borderBottomRightRadius: isObi ? 32 : 12,
                borderWidth: 1,
                borderColor: isLoop ? "#2F2B4C" : "white",
                borderLeftWidth: 0,
              },
              hasError
                ? {
                    borderColor: "#FF2222",
                  }
                : null,
            ]}
            onPress={() => {
              qrCodeScannerModal.open();
            }}
          >
            <View
              style={[
                {
                  position: "absolute",
                  width: 1,
                  backgroundColor: isLoop ? "#2F2B4C" : "white",
                  height: "100%",
                  left: 0,
                },
                hasError
                  ? {
                      backgroundColor: "#FF2222",
                    }
                  : null,
              ]}
            />
            {isObi ? (
              <ObiQr />
            ) : (
              <FontAwesomeIcon
                icon={faQrcode}
                style={{ color: isLoop ? "#887CEB" : "white" }}
                size={32}
              />
            )}
          </TouchableOpacity>
        </View>
        <TextInputInvalidMessage message={fieldState.error?.message} />
        {qrCodeScannerModal.render()}
      </>
    );
  }
);
