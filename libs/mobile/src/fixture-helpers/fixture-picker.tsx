import { observer } from "mobx-react-lite";
import { View } from "react-native";
import { LaunchArguments } from "react-native-launch-arguments";
import invariant from "tiny-invariant";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore Ignore missing declaration file
import * as fixtures from "../../cosmos.userdeps";

export const FixturePicker = observer(function FixturePicker() {
  const { fixture } = LaunchArguments.value<{ fixture?: string }>();
  invariant(fixture, "No fixture specified");

  const chosenFixture =
    fixtures.fixtures[fixture as keyof typeof fixtures.fixtures];
  const Decorator = fixtures.decorators["__stories__/cosmos.decorator.tsx"];
  console.log(chosenFixture);

  return (
    <View testID="detox-container" style={{ flex: 1 }}>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore TODO: this probably needs some work */}
      <Decorator>{chosenFixture.module.default}</Decorator>
    </View>
  );
});
