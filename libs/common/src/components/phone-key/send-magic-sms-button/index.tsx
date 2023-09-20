import { observer } from "mobx-react-lite";
import { useIntl } from "react-intl";
import { View } from "react-native";

import { AsyncButton } from "../../buttons";

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
  const _description = description;
  const intl = useIntl();
  return (
    <View>
      {/* {description ? (
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
      ) : null} */}
      <AsyncButton
        label={intl.formatMessage({
          id: "onboarding2.sendmagicsms",
          defaultMessage: "Get Magic SMS",
        })}
        flavor="primary"
        disabled={disabled}
        onPress={onPress}
      />
    </View>
  );
});
