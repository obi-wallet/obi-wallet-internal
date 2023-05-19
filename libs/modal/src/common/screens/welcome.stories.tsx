import { OnboardingRoute, RootStack, WelcomeScreen } from "@obi-wallet/common";
import type { Meta, StoryObj } from "@storybook/react";

import { Container } from "../../container";
import { Provider } from "../../provider";

const meta: Meta<typeof WelcomeScreen> = {
  title: "common/screens/WelcomeScreen",
  component: WelcomeScreen,
};

export default meta;

type Story = StoryObj<typeof WelcomeScreen>;

export const Primary: Story = {
  render: () => (
    <Container>
      <Provider>
        <RootStack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <RootStack.Screen
            name={OnboardingRoute.Welcome}
            component={WelcomeScreen}
          />
        </RootStack.Navigator>
      </Provider>
    </Container>
  ),
};
