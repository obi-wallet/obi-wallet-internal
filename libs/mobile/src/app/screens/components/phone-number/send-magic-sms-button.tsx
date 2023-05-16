import { faInfoCircle } from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common-deprecated";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { View } from "react-native";

import SMS from "./assets/sms.svg";
import { Button } from "../../../button";
import { useStore } from "../../../stores";
import { isSmallScreenNumber } from "../screen-size";

export interface SendMagicSmsButtonProps {
  description?: string;
  disabled?: boolean;
  onPress: () => void;
}

export const SendMagicSmsButton = observer(function SendMagicSmsButton({
  description,

  onPress,
  disabled,
}: SendMagicSmsButtonProps) {
  const intl = useIntl();
  const { configStore } = useStore();
  const isObi = configStore.isObi();

  return (
    <View>
      {description ? (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <FontAwesomeIcon
            icon={faInfoCircle}
            style={{
              color: "#7B87A8",
              margin: 5,
            }}
          />

          <Text
            style={{
              color: "#F6F5FF",
              marginLeft: 10,
              opacity: 0.7,
              fontSize: isSmallScreenNumber(10, 12),
            }}
          >
            {description}
          </Text>
        </View>
      ) : null}
      <Button
        label={intl.formatMessage({
          id: "onboarding2.sendmagicsms",
          defaultMessage: "Get Magic SMS",
        })}
        LeftIcon={isObi ? undefined : SMS}
        flavor="blue"
        disabled={disabled}
        onPress={() => {
          if (!disabled) {
            onPress();
          }
        }}
      />
    </View>
  );
});
