import { ParamListBase, useFocusEffect } from "@react-navigation/native";
import {
  createStackNavigator,
  StackScreenProps,
} from "@react-navigation/stack";
import type { Meta, StoryObj } from "@storybook/react";

function ScreenA({ navigation }: StackScreenProps<ParamListBase>) {
  useFocusEffect(() => {
    setTimeout(() => {
      navigation.navigate("B");
    }, 1000);
  });

  return <div style={{ backgroundColor: "blue", height: "100%" }} />;
}

function ScreenB({ navigation }: StackScreenProps<ParamListBase>) {
  useFocusEffect(() => {
    setTimeout(() => {
      navigation.navigate("A");
    }, 1000);
  });

  return <div style={{ backgroundColor: "red", height: "100%" }} />;
}

const Stack = createStackNavigator();

function Navigation() {
  return (
    <Stack.Navigator
      screenOptions={{
        animationEnabled: true,
        headerShown: false,
      }}
    >
      <Stack.Screen name="A" component={ScreenA} />
      <Stack.Screen name="B" component={ScreenB} />
    </Stack.Navigator>
  );
}

const meta: Meta<typeof Navigation> = {
  title: "Navigation",
  component: Navigation,
};

export default meta;

type Story = StoryObj<typeof Navigation>;

export const Primary: Story = {
  render: () => <Navigation />,
};
