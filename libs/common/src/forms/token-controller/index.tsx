import { faAngleDown } from "@fortawesome/free-solid-svg-icons/faAngleDown";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Portal } from "@gorhom/portal";
import { Brand } from "@obi-wallet/config";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { ComponentType, useRef, useState } from "react";
import { ControllerFieldState } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

import {
  BottomSheetBackdrop,
  BottomSheetNew,
  CoinIcon,
  RefreshableFlatList,
  TextInput,
  TextInputInvalidMessage,
} from "../../components";
import { useStore } from "../../contexts";
import { EnrichedToken } from "../../hooks";

export type TokenControllerProps = {
  field: {
    onChange: (value: { id: string; amount: string }) => void;
    onBlur: () => void;
    value: { id: string; amount: string };
  };
  fieldState: ControllerFieldState;
  balances?: EnrichedToken[];
} & (
  | {
      refetch: () => Promise<void>;
    }
  | {
      disableTokenSelect: true;
    }
);

export const TokenController = observer<TokenControllerProps>(
  function TokenController({
    balances,
    field,
    fieldState,
    ...bottomSheetProps
  }) {
    const { configStore } = useStore();
    const isObi = configStore.isObi();
    const isLoop = configStore.isLoop();

    const [denominationOpened, setDenominationOpened] = useState(false);

    const hasError = fieldState.error !== undefined;
    const selectedToken = balances?.find((b) => b.id === field.value.id);

    const allowTokenSelect = R.has("refetch", bottomSheetProps);
    const Container: ComponentType<TouchableOpacityProps> = allowTokenSelect
      ? TouchableOpacity
      : (View as unknown as ComponentType<TouchableOpacityProps>);

    return (
      <>
        <Text
          style={{
            color: isLoop ? "#787B9C" : "#ffffff",
            textTransform: "uppercase",
            fontSize: 10,
            marginBottom: 10,
          }}
        >
          <FormattedMessage id="send.amount" defaultMessage="Amount" />
        </Text>
        <View
          style={[
            {
              borderColor: isLoop ? "#2F2B4C" : "#ffffff",
              borderWidth: 1,
              borderRadius: 7,
              flexDirection: "row",
            },
            hasError
              ? {
                  borderColor: "#FF2222",
                }
              : null,
          ]}
        >
          <Container
            style={{
              borderRadius: 12,
              backgroundColor: isLoop ? "#17162C" : "#272727",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            onPress={() => {
              setDenominationOpened(true);
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 36,
                margin: 12,
              }}
            >
              <CoinIcon source={selectedToken?.icon ?? null} />
            </View>
            <View style={{ justifyContent: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "600" }}>
                {selectedToken?.denom}
              </Text>
              <Text style={{ color: "#fff", fontWeight: "400" }}>
                Balance: {selectedToken?.amount}
              </Text>
            </View>

            {allowTokenSelect ? (
              <View style={{ paddingHorizontal: 10, alignItems: "center" }}>
                <FontAwesomeIcon
                  icon={faAngleDown}
                  style={{ color: isLoop ? "#7B87A8" : "white" }}
                />
              </View>
            ) : null}
          </Container>
          <TextInput
            keyboardType="numeric"
            style={{
              alignSelf: "center",
              borderColor: "transparent",
              flex: 1,
              paddingLeft: 20,
              paddingRight: 10,
            }}
            inputStyle={{
              borderColor: "transparent",
              textAlign: "right",
              fontSize: 18,
              fontWeight: "500",
            }}
            placeholder="0"
            value={field.value.amount}
            onChangeText={(amount) => {
              field.onChange({
                id: field.value.id,
                amount,
              });
            }}
            onBlur={field.onBlur}
          />
        </View>
        <TextInputInvalidMessage message={fieldState.error?.message} />
        {R.has("refetch", bottomSheetProps) ? (
          <BottomSheetNew
            open={denominationOpened}
            onClose={() => {
              setDenominationOpened(false);
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "transparent",
                position: "relative",
                paddingHorizontal: 5,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: 10,
                  paddingLeft: 10,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#f6f5ff",
                    }}
                  >
                    <FormattedMessage
                      id="send.denomination"
                      defaultMessage="Denomination"
                    />
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#f6f5ff",
                      opacity: isLoop ? 0.6 : 1,
                    }}
                  >
                    <FormattedMessage
                      id="send.selectcoin"
                      defaultMessage="Select the coin you'd like to send"
                    />
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setDenominationOpened(false);
                  }}
                  style={{ alignSelf: "flex-start" }}
                >
                  <FontAwesomeIcon
                    icon={faTimes}
                    style={{ color: "#F6F5FF" }}
                  />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  backgroundColor: isLoop ? "transparent" : "#272727",
                  flex: 1,
                  ...(isObi
                    ? {
                        borderRadius: 7,
                      }
                    : {}),
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: isLoop ? "#f6f5ff" : "white",
                      opacity: isLoop ? 0.6 : 1,
                      textTransform: "uppercase",
                    }}
                  >
                    <FormattedMessage id="send.name" defaultMessage="Name" />
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: isLoop ? "#f6f5ff" : "white",
                      opacity: isLoop ? 0.6 : 1,
                      textTransform: "uppercase",
                    }}
                  >
                    <FormattedMessage
                      id="send.holdings"
                      defaultMessage="Holdings"
                    />
                  </Text>
                </View>
                <RefreshableFlatList
                  data={balances ?? []}
                  keyExtractor={(item) => item.id}
                  renderItem={(props) => (
                    <CoinRenderer
                      {...props}
                      selected={props.item.id === field.value.id}
                      onPress={() => {
                        setDenominationOpened(false);
                        field.onChange({
                          ...field.value,
                          id: props.item.id,
                        });
                      }}
                    />
                  )}
                  refetch={bottomSheetProps.refetch}
                />
              </View>
            </View>
          </BottomSheetNew>
        ) : null}
        {/*{R.has("refetch", bottomSheetProps) ? (*/}
        {/*  <Portal hostName="bottom-sheet">*/}
        {/*    <BottomSheetBackdrop*/}
        {/*      onPress={() => triggerBottomSheet(false)}*/}
        {/*      visible={denominationOpened}*/}
        {/*    />*/}
        {/*    <BottomSheet*/}
        {/*      handleIndicatorStyle={{ backgroundColor: "white" }}*/}
        {/*      backgroundStyle={{*/}
        {/*        backgroundColor: isLoop ? "#100F1E" : "#1a1a1a",*/}
        {/*      }}*/}
        {/*      handleStyle={{ backgroundColor: "transparent" }}*/}
        {/*      snapPoints={["60"]}*/}
        {/*      enablePanDownToClose={true}*/}
        {/*      ref={bottomSheetRef}*/}
        {/*      index={-1}*/}
        {/*      backdropComponent={() => null}*/}
        {/*      onClose={() => {*/}
        {/*        setDenominationOpened(false);*/}
        {/*      }}*/}
        {/*    >*/}
        {/*      <BottomSheetView*/}
        {/*        style={{*/}
        {/*          flex: 1,*/}
        {/*          backgroundColor: "transparent",*/}
        {/*          position: "relative",*/}
        {/*          paddingHorizontal: isLoop ? 20 : 5,*/}
        {/*        }}*/}
        {/*      >*/}
        {/*        <View*/}
        {/*          style={{*/}
        {/*            flexDirection: "row",*/}
        {/*            justifyContent: "space-between",*/}
        {/*            alignItems: "center",*/}
        {/*            paddingBottom: 10,*/}
        {/*            paddingLeft: 10,*/}
        {/*          }}*/}
        {/*        >*/}
        {/*          <View>*/}
        {/*            <Text*/}
        {/*              style={{*/}
        {/*                fontSize: 16,*/}
        {/*                fontWeight: "600",*/}
        {/*                color: "#f6f5ff",*/}
        {/*              }}*/}
        {/*            >*/}
        {/*              <FormattedMessage*/}
        {/*                id="send.denomination"*/}
        {/*                defaultMessage="Denomination"*/}
        {/*              />*/}
        {/*            </Text>*/}
        {/*            <Text*/}
        {/*              style={{*/}
        {/*                fontSize: 12,*/}
        {/*                color: "#f6f5ff",*/}
        {/*                opacity: isLoop ? 0.6 : 1,*/}
        {/*              }}*/}
        {/*            >*/}
        {/*              <FormattedMessage*/}
        {/*                id="send.selectcoin"*/}
        {/*                defaultMessage="Select the coin you'd like to send"*/}
        {/*              />*/}
        {/*            </Text>*/}
        {/*          </View>*/}
        {/*          <TouchableOpacity*/}
        {/*            onPress={() => triggerBottomSheet(false)}*/}
        {/*            style={{ alignSelf: "flex-start" }}*/}
        {/*          >*/}
        {/*            <FontAwesomeIcon*/}
        {/*              icon={faTimes}*/}
        {/*              style={{ color: "#F6F5FF" }}*/}
        {/*            />*/}
        {/*          </TouchableOpacity>*/}
        {/*        </View>*/}
        {/*        <View*/}
        {/*          style={{*/}
        {/*            backgroundColor: isLoop ? "transparent" : "#272727",*/}
        {/*            flex: 1,*/}
        {/*            ...(isObi*/}
        {/*              ? {*/}
        {/*                  borderRadius: 7,*/}
        {/*                }*/}
        {/*              : {}),*/}
        {/*          }}*/}
        {/*        >*/}
        {/*          <View*/}
        {/*            style={{*/}
        {/*              flexDirection: "row",*/}
        {/*              justifyContent: "space-between",*/}
        {/*              padding: 10,*/}
        {/*            }}*/}
        {/*          >*/}
        {/*            <Text*/}
        {/*              style={{*/}
        {/*                fontSize: 12,*/}
        {/*                color: isLoop ? "#f6f5ff" : "white",*/}
        {/*                opacity: isLoop ? 0.6 : 1,*/}
        {/*                textTransform: "uppercase",*/}
        {/*              }}*/}
        {/*            >*/}
        {/*              <FormattedMessage id="send.name" defaultMessage="Name" />*/}
        {/*            </Text>*/}
        {/*            <Text*/}
        {/*              style={{*/}
        {/*                fontSize: 12,*/}
        {/*                color: isLoop ? "#f6f5ff" : "white",*/}
        {/*                opacity: isLoop ? 0.6 : 1,*/}
        {/*                textTransform: "uppercase",*/}
        {/*              }}*/}
        {/*            >*/}
        {/*              <FormattedMessage*/}
        {/*                id="send.holdings"*/}
        {/*                defaultMessage="Holdings"*/}
        {/*              />*/}
        {/*            </Text>*/}
        {/*          </View>*/}
        {/*          <RefreshableFlatList*/}
        {/*            data={balances ?? []}*/}
        {/*            keyExtractor={(item) => item.id}*/}
        {/*            renderItem={(props) => (*/}
        {/*              <CoinRenderer*/}
        {/*                {...props}*/}
        {/*                selected={props.item.id === field.value.id}*/}
        {/*                onPress={() => {*/}
        {/*                  triggerBottomSheet(false);*/}
        {/*                  field.onChange({*/}
        {/*                    ...field.value,*/}
        {/*                    id: props.item.id,*/}
        {/*                  });*/}
        {/*                }}*/}
        {/*              />*/}
        {/*            )}*/}
        {/*            refetch={bottomSheetProps.refetch}*/}
        {/*          />*/}
        {/*        </View>*/}
        {/*      </BottomSheetView>*/}
        {/*    </BottomSheet>*/}
        {/*  </Portal>*/}
        {/*) : null}*/}
      </>
    );
  }
);

interface CoinRendererProps {
  item: EnrichedToken;
  selected: boolean;
  onPress: () => void;
}

const getBrandBackground = (brand: Brand) => {
  switch (brand) {
    case Brand.Loop:
      return {
        selected: "#17162C",
        unselected: "#100F1E",
      };
    case Brand.Obi:
      return {
        selected: "rgba(0,0,0,0.1)",
        unselected: "transparent",
      };
  }
};

const CoinRenderer = observer(function CoinRenderer({
  item,
  selected,
  onPress,
}: CoinRendererProps) {
  const { configStore } = useStore();
  const brandColors = getBrandBackground(configStore.brand);
  return (
    <TouchableOpacity
      style={{
        backgroundColor: selected
          ? brandColors.selected
          : brandColors.unselected,
        marginVertical: 10,
        padding: 10,
        flexDirection: "row",
        justifyContent: "space-between",
      }}
      onPress={onPress}
    >
      <View style={{ flexDirection: "row" }}>
        <View
          style={{
            width: 36,
            height: 36,
            marginRight: 10,
            borderRadius: 12,
          }}
        >
          <CoinIcon source={item.icon} />
        </View>
        <View>
          <Text style={{ color: "#f6f5ff", fontWeight: "500" }}>
            {item.label}
          </Text>
          <Text
            style={{
              color: "#f6f5ff",
              fontWeight: "500",
              fontSize: 12,
              opacity: 0.6,
            }}
          >
            {item.denom}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ color: "#f6f5ff", fontWeight: "500" }}>
          ${(item.usdValue ?? 0).toFixed(2)}
        </Text>
        <Text
          style={{
            color: "#f6f5ff",
            fontWeight: "500",
            fontSize: 12,
            opacity: 0.6,
          }}
        >
          {item.amount} {item.denom}
        </Text>
      </View>
    </TouchableOpacity>
  );
});
