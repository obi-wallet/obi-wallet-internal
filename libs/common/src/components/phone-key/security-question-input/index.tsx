import { observer } from "mobx-react-lite";
import { ComponentType, Dispatch, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { TextInputProps, View } from "react-native";

import { DropDownPicker } from "./drop-down-picker";
import { isSmallScreenNumber } from "../../../helpers";
import { TextInput } from "../../text-input";
import { BaseTextInput, Text } from "../../typography";
import { useTheme } from "@emotion/react";

export type SetStateCallback<S> = (prevState: S) => S;
export type OnSecurityQuestionChange = Dispatch<SetStateCallback<string>>;

export type SecurityQuestionInputProps = {
  securityQuestion: string;
} & (
  | {
      disabled: true;
      onSecurityQuestionChange?: OnSecurityQuestionChange;
    }
  | {
      disabled?: false;
      onSecurityQuestionChange: OnSecurityQuestionChange;
    }
);

export type SecurityQuestionInputWithAnswerProps = {
  securityAnswer: string;
  onSecurityAnswerChange: (securityAnswer: string) => void;
  CustomTextInput?: ComponentType<TextInputProps>;
} & SecurityQuestionInputProps;

export const SecurityQuestionInputWithAnswer =
  observer<SecurityQuestionInputWithAnswerProps>(
    function SecurityQuestionInputWithAnswer({
      CustomTextInput = BaseTextInput,
      securityAnswer,
      onSecurityAnswerChange,
      ...props
    }) {
      const intl = useIntl();

      return (
        <View style={{ zIndex: 999 }}>
          <SecurityQuestionInput {...props} />

          <TextInput
            label={intl.formatMessage({
              id: "onboarding2.answer",
              defaultMessage: "Answer",
            })}
            placeholder={intl.formatMessage({
              id: "onboarding2.answerlabel",
              defaultMessage: "Type your answer here",
            })}
            style={{ marginTop: 15 }}
            value={securityAnswer}
            onChangeText={onSecurityAnswerChange}
            CustomTextInput={CustomTextInput}
          />
        </View>
      );
    },
  );

export const SecurityQuestionInput = observer(function SecurityQuestionInput({
  disabled,
  securityQuestion,
  onSecurityQuestionChange = () => {
    // noop if disabled
  },
}: SecurityQuestionInputProps) {
  const [dropdownPickerOpen, setDropdownPickerOpen] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState(
    useSecurityQuestions(),
  );
  const theme = useTheme();

  return (
    <>
      <Text
        style={{
          color: "white",
          fontSize: 10,
          textTransform: "uppercase",
          // marginTop: isSmallScreenNumber(20, 36),
          marginBottom: 5,
          ...theme.dropdown.labelStyle,
        }}
      >
        <FormattedMessage
          id="onboarding2.securityquestion"
          defaultMessage="Security Question"
        />
      </Text>

      <DropDownPicker
        disabled={disabled}
        showArrowIcon={!disabled}
        open={dropdownPickerOpen}
        value={securityQuestion}
        items={securityQuestions}
        setOpen={setDropdownPickerOpen}
        setValue={onSecurityQuestionChange}
        setItems={setSecurityQuestions}
        listMode="SCROLLVIEW"
        listItemContainerStyle={{
          height: isSmallScreenNumber(40, 50),
        }}
        listItemLabelStyle={{
          fontSize: isSmallScreenNumber(10, 14),
        }}
        dropDownContainerStyle={{
          backgroundColor: "#1E1E1E",
        }}
        style={{
          borderRadius: 30,
          borderColor: "white",
          minHeight: isSmallScreenNumber(46, 56),
        }}
        scrollViewProps={{
          persistentScrollbar: true,
          showsVerticalScrollIndicator: true,
          indicatorStyle: "white",
        }}
        labelStyle={{
          fontSize: isSmallScreenNumber(10, 14),
        }}
      />
    </>
  );
});

export function useSecurityQuestionInput() {
  const [securityQuestion, setSecurityQuestion] = useState(
    useSecurityQuestions()[0].value,
  );
  const [securityAnswer, setSecurityAnswer] = useState("");

  return {
    securityQuestion,
    setSecurityQuestion,
    securityAnswer,
    setSecurityAnswer,
  };
}

export function useSecurityQuestions() {
  const intl = useIntl();

  const birthPlaceLabel = intl.formatMessage({
    id: "onboarding2.securityquestion.birthplace",
    defaultMessage: "What city and country were you born in?",
  });
  const schoolnameLabel = intl.formatMessage({
    id: "onboarding2.securityquestion.schoolname",
    defaultMessage:
      "What is the full name of the last elementary/primary school I attended?",
  });
  const firstcarLabel = intl.formatMessage({
    id: "onboarding2.securityquestion.firstcar",
    defaultMessage: "What was the make and model of your first car?",
  });
  const firstkissLabel = intl.formatMessage({
    id: "onboarding2.securityquestion.firstkiss",
    defaultMessage: "What is the full name of my first kiss?",
  });

  return useMemo(() => {
    return [
      {
        label: birthPlaceLabel,
        value: "birthplace",
      },
      {
        label: schoolnameLabel,
        value: "schoolname",
      },
      {
        label: firstcarLabel,
        value: "firstcar",
      },
      {
        label: firstkissLabel,
        value: "firstkiss",
      },
    ];
  }, [birthPlaceLabel, firstcarLabel, firstkissLabel, schoolnameLabel]);
}
