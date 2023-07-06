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
import { isSmallScreenNumber, isWeb } from "../../helpers";

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
    const hasError = fieldState.error !== undefined;

    const qrCodeScannerModal = useQrCodeScannerModal(({ data, close }) => {
      if (Sdk.chainId(chainId).transactions.validateAddress(data)) {
        field.onChange(data);
        close();
      }
    });

    if (isWeb()) {
      return (
        <TextInput
          label={label}
          placeholder={placeholder}
          style={{ flex: 1 }}
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          invalidMessage={fieldState.error?.message}
        />
      );
    }

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
                borderTopRightRadius: 32,
                borderBottomRightRadius: 32,
                borderWidth: 1,
                borderColor: "white",
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
                  backgroundColor: "white",
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
            <ObiQr />
          </TouchableOpacity>
        </View>
        <TextInputInvalidMessage message={fieldState.error?.message} />
        {qrCodeScannerModal.render()}
      </>
    );
  }
);
