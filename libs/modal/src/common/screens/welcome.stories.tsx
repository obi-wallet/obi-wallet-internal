import { Welcome } from "@obi-wallet/common";
import type { Meta, StoryObj } from "@storybook/react";

import { Container } from "../../container";
import { Provider } from "../../provider";

const meta: Meta<typeof Welcome> = {
  title: "common/screens/Welcome",
  component: Welcome,
};

export default meta;

type Story = StoryObj<typeof Welcome>;

export const Primary: Story = {
  render: () => (
    <Container>
      <Provider>
        <Welcome
          onCreate={noop("onCreate")}
          onRecover={noop("onRecover")}
          onEnterDemoMode={noop("onEnterDemoMode")}
        />
      </Provider>
    </Container>
  ),
};

function noop(label: string) {
  return function () {
    console.log(label);
  };
}
