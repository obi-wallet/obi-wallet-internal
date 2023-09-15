import { useTheme } from "@emotion/react";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons/faAngleDown";
import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Portal } from "@gorhom/portal";
import { observer } from "mobx-react-lite";
import * as R from "ramda";
import { ComponentType, useState } from "react";
import { ControllerFieldState } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import {
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";

import {
  BottomSheetNew,
  BottomSheetBackdrop,
  CoinIcon,
  RefreshableFlatList,
  TextInput,
  TextInputInvalidMessage,
} from "../../components";
import { isWeb } from "../../helpers";
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
    const theme = useTheme();

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
            color: theme.colors?.label,
            textTransform: "uppercase",
            fontSize: 12,
            marginBottom: 6,
          }}
        >
          <FormattedMessage
            id={theme.style === "ztx" ? "send.denomination" : "send.amount"}
            defaultMessage="Amount"
          />
        </Text>
        <View
          style={[
            {
              borderColor: "#ffffff",
              borderWidth: 1,
              borderRadius: 7,
              flexDirection: "row",
            },
            hasError
              ? {
                  borderColor: "#FF2222",
                }
              : null,
            theme.send?.token?.container,
          ]}
        >
          <Container
            style={[
              {
                borderRadius: 12,
                backgroundColor: theme.colors.panelBackground,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderWidth: 0,
              },
              theme.send?.token.asset,
            ]}
            onPress={() => {
              setDenominationOpened((prev) => !prev);
            }}
          >
            {theme.style === "ztx" ? (
              <>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 12,
                  }}
                >
                  <View style={{ width: 18, height: 18 }}>
                    <CoinIcon source={selectedToken?.icon ?? null} />
                  </View>
                  <Text
                    style={[
                      { color: "#F6F8FC", marginLeft: 12 },
                      theme.textStyles.regular,
                    ]}
                  >
                    {selectedToken?.denom}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={[{ color: "#929EB5" }, theme.textStyles.regular]}
                  >
                    {`Balance: ${selectedToken?.amount} ${selectedToken?.denom}`}
                  </Text>

                  {allowTokenSelect ? (
                    <View
                      style={{
                        paddingHorizontal: 10,
                        alignItems: "center",
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faAngleDown}
                        style={{
                          color: "#F6F8FC",
                          width: 15,
                          height: 9,
                          // @ts-ignore
                          outline: 0,
                        }}
                      />
                    </View>
                  ) : null}
                </View>
              </>
            ) : (
              <>
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
                      style={{ color: "white" }}
                    />
                  </View>
                ) : null}
              </>
            )}
          </Container>

          {R.has("refetch", bottomSheetProps) &&
            isWeb() &&
            denominationOpened && (
              <TouchableWithoutFeedback
                onPress={() => setDenominationOpened(false)}
              >
                <View style={{ position: "relative", zIndex: 9999 }}>
                  <View
                    style={{
                      marginTop: 6,
                      position: "absolute",
                      width: "100%",
                    }}
                  >
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
                          coinSize={24}
                          assetItemStyle={{
                            height: 50,
                            paddingHorizontal: 16,
                            marginVertical: 0,
                            borderRadius: 3,
                          }}
                        />
                      )}
                      refetch={bottomSheetProps.refetch}
                      style={{
                        backgroundColor: "#24242e",
                        borderRadius: 3,
                      }}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            )}
          <View>
            {theme.style === "ztx" && (
              <Text
                style={{
                  color: theme.colors?.label,
                  textTransform: "uppercase",
                  fontSize: 12,
                  marginBottom: 6,
                  marginTop: 24,
                }}
              >
                <FormattedMessage id="send.amount" defaultMessage="Amount" />
              </Text>
            )}

            <View
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                },
                theme.send?.token.amount.conatiner,
              ]}
            >
              <TextInput
                keyboardType="numeric"
                style={[
                  {
                    alignSelf: "center",
                    flex: 1,
                    width: "100%",
                  },
                ]}
                inputStyle={[
                  {
                    borderColor: "transparent",
                    textAlign: "right",
                    fontSize: 18,
                    fontWeight: "500",
                    paddingHorizontal: 0,
                    height: 42,
                  },
                  theme.send?.token.amount.input,
                ]}
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
              <Text
                style={{
                  color: "#929EB5",
                  textTransform: "uppercase",
                  fontSize: 12,
                }}
              >
                {`${
                  (selectedToken?.usdValue || 0) * Number(field.value.amount)
                } USD`}
              </Text>
            </View>
          </View>
        </View>
        <TextInputInvalidMessage message={fieldState.error?.message} />
        {R.has("refetch", bottomSheetProps) && !isWeb() ? (
          <Portal hostName="bottom-sheet">
            <BottomSheetBackdrop
              onPress={() => setDenominationOpened(false)}
              visible={denominationOpened}
            />
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
                        opacity: 1,
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
                    backgroundColor: theme.colors.panelBackground,
                    flex: 1,
                    borderRadius: 7,
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
                        color: "white",
                        textTransform: "uppercase",
                      }}
                    >
                      <FormattedMessage id="send.name" defaultMessage="Name" />
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: "white",
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
          </Portal>
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
  },
);

interface CoinRendererProps {
  item: EnrichedToken;
  selected: boolean;
  onPress: () => void;
  coinSize?: number;
  assetItemStyle?: ViewStyle;
}

const getBrandBackground = () => {
  return {
    selected: "rgba(0,0,0,0.1)",
    unselected: "transparent",
  };
};

const CoinRenderer = observer(function CoinRenderer({
  item,
  selected,
  onPress,
  coinSize = 36,
  assetItemStyle,
}: CoinRendererProps) {
  const brandColors = getBrandBackground();
  const theme = useTheme();
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: selected
            ? brandColors.selected
            : brandColors.unselected,
          marginVertical: 10,
          padding: 10,
          flexDirection: "row",
          justifyContent: "space-between",
          borderRadius: 12,
        },
        assetItemStyle,
      ]}
      onPress={onPress}
    >
      <View style={{ flexDirection: "row" }}>
        <View
          style={{
            width: coinSize,
            height: coinSize,
            marginRight: 10,
            borderRadius: 12,
          }}
        >
          <CoinIcon source={item.icon} />
        </View>
        <View>
          <Text
            style={[
              { color: "#f6f5ff", fontWeight: "500" },
              theme.textStyles.regular,
            ]}
          >
            {item.label}
          </Text>
          <Text
            style={[
              {
                color: "#f6f5ff",
                fontWeight: "500",
                fontSize: 12,
                opacity: 0.6,
              },
              theme.textStyles.regular,
            ]}
          >
            {item.denom}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text
          style={[
            { color: "#f6f5ff", fontWeight: "500" },
            theme.textStyles.regular,
          ]}
        >
          ${(item.usdValue ?? 0).toFixed(2)}
        </Text>
        <Text
          style={[
            {
              color: "#f6f5ff",
              fontWeight: "500",
              fontSize: 12,
              opacity: 0.6,
            },
            theme.textStyles.regular,
          ]}
        >
          {item.amount} {item.denom}
        </Text>
      </View>
    </TouchableOpacity>
  );
});
