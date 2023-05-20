import {
  DeviceKeyScreen,
  KeyRoute,
  OnboardingRoute,
  PhoneKeyConfirmScreen,
  PhoneKeyRequestScreen,
  RootStack,
  WelcomeScreen,
} from "@obi-wallet/common";
import type { Meta, StoryObj } from "@storybook/react";

function App({ initialRouteName }: { initialRouteName: string }) {
  return (
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
      <RootStack.Screen name={KeyRoute.DeviceKey} component={DeviceKeyScreen} />
      <RootStack.Screen
        name={KeyRoute.PhoneKeyRequest}
        component={PhoneKeyRequestScreen}
      />
      <RootStack.Screen
        name={KeyRoute.PhoneKeyConfirm}
        component={PhoneKeyConfirmScreen}
      />
    </RootStack.Navigator>
  );
}

const meta: Meta<typeof App> = {
  title: "common/Screens",
  component: App,
};

export default meta;

type Story = StoryObj<typeof App>;

export const Welcome: Story = {
  render: () => {
    return <App initialRouteName={OnboardingRoute.Welcome} />;
  },
};

export const DeviceKey: Story = {
  render: () => {
    return <App initialRouteName={KeyRoute.DeviceKey} />;
  },
};

export const PhoneKeyRequest: Story = {
  render: () => {
    return <App initialRouteName={KeyRoute.PhoneKeyRequest} />;
  },
};

export const PhoneKeyConfirm: Story = {
  render: () => {
    return <App initialRouteName={KeyRoute.PhoneKeyConfirm} />;
  },
};
