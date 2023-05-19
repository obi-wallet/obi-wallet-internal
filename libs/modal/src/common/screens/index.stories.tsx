import {
  DeviceKeyScreen,
  KeyRoute,
  OnboardingRoute,
  RootStack,
  WelcomeScreen,
} from "@obi-wallet/common";
import type { Meta, StoryObj } from "@storybook/react";

import { Container } from "../../container";
import { Provider } from "../../provider";

function App({ initialRouteName }: { initialRouteName: string }) {
  return (
    <Container>
      <Provider>
        <RootStack.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName={initialRouteName}
        >
          <RootStack.Screen
            name={OnboardingRoute.Welcome}
            component={WelcomeScreen}
          />
          <RootStack.Screen
            name={KeyRoute.DeviceKey}
            component={DeviceKeyScreen}
          />
        </RootStack.Navigator>
      </Provider>
    </Container>
  );
}

const meta: Meta<typeof App> = {
  title: "common/Screens",
  component: App,
};

export default meta;

type Story = StoryObj<typeof App>;

export const Welcome: Story = {
  render: () => <App initialRouteName={OnboardingRoute.Welcome} />,
};

export const DeviceKey: Story = {
  render: () => <App initialRouteName={KeyRoute.DeviceKey} />,
};
