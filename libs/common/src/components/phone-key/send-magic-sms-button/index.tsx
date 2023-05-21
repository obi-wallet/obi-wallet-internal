import { faInfoCircle } from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { View } from "react-native";

import { useStore } from "../../../contexts";
import { isSmallScreenNumber } from "../../../helpers";
import { AsyncButton, Button } from "../../buttons";
import { Text } from "../../typography";

// TODO:
// import SMS from "./assets/sms.svg";
const SMS = undefined;

export interface SendMagicSmsButtonProps {
  description?: string;
  disabled?: boolean;
  onPress: () => Promise<void>;
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
      <AsyncButton
        label={intl.formatMessage({
          id: "onboarding2.sendmagicsms",
          defaultMessage: "Get Magic SMS",
        })}
        LeftIcon={isObi ? undefined : SMS}
        flavor="blue"
        disabled={disabled}
        onPress={onPress}
      />
    </View>
  );
});
