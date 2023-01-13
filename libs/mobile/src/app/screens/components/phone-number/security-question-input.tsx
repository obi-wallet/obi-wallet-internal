import { Text, TextInput as OriginalTextInput } from "@obi-wallet/common";
import { ComponentType, Dispatch, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { TextInputProps, View } from "react-native";

import { DropDownPicker } from "../../../drop-down-picker";
import { useStore } from "../../../stores";
import { TextInput } from "../../../text-input";
import { isSmallScreenNumber } from "../screen-size";

export type SetStateCallback<S> = (prevState: S) => S;
export type OnSecurityQuestionChange = Dispatch<SetStateCallback<string>>;

export type SecurityQuestionInputProps = {
  securityQuestion: string;
  securityAnswer: string;
  onSecurityAnswerChange: (securityAnswer: string) => void;
  CustomTextInput?: ComponentType<TextInputProps>;
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

export function SecurityQuestionInput({
  disabled,
  securityQuestion,
  onSecurityQuestionChange = () => {
    // noop if disabled
  },
  securityAnswer,
  onSecurityAnswerChange,
  CustomTextInput = OriginalTextInput,
}: SecurityQuestionInputProps) {
  const [dropdownPickerOpen, setDropdownPickerOpen] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState(
    useSecurityQuestions()
  );

  const intl = useIntl();
  const isObi = useStore().configStore.isObi();

  return (
    <View style={{ zIndex: 999 }}>
      <Text
        style={{
          color: isObi ? "white" : "#787B9C",
          fontSize: 10,
          textTransform: "uppercase",
          marginTop: isSmallScreenNumber(20, 36),
          marginBottom: 5,
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
          backgroundColor: isObi ? "#1E1E1E" : "#000",
        }}
        style={{
          borderRadius: isObi ? 30 : 12,
          borderColor: isObi ? "white" : "#787B9C",
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
}

export function useSecurityQuestionInput() {
  const [securityQuestion, setSecurityQuestion] = useState(
    useSecurityQuestions()[0].value
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

  return [
    {
      label: intl.formatMessage({
        id: "onboarding2.securityquestion.birthplace",
        defaultMessage: "What city and country were you born in?",
      }),
      value: "birthplace",
    },
    {
      label: intl.formatMessage({
        id: "onboarding2.securityquestion.schoolname",
        defaultMessage:
          "What is the full name of the last elementary/primary school I attended?",
      }),
      value: "schoolname",
    },
    {
      label: intl.formatMessage({
        id: "onboarding2.securityquestion.firstcar",
        defaultMessage: "What was the make and model of your first car?",
      }),
      value: "firstcar",
    },
    {
      label: intl.formatMessage({
        id: "onboarding2.securityquestion.firstkiss",
        defaultMessage: "What is the full name of my first kiss?",
      }),
      value: "firstkiss",
    },
  ];
}
