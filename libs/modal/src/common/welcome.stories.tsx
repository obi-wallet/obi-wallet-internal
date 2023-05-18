import { Welcome } from "@obi-wallet/common";
import type { Meta, StoryObj } from "@storybook/react";

import { Provider } from "../provider";

const meta: Meta<typeof Welcome> = {
  title: "Welcome",
  component: Welcome,
};

export default meta;

type Story = StoryObj<typeof Welcome>;

export const Primary: Story = {
  render: () => (
    <Provider>
      <Welcome
        onCreate={noop("onCreate")}
        onRecover={noop("onRecover")}
        onEnterDemoMode={noop("onEnterDemoMode")}
      />
    </Provider>
  ),
};

function noop(label: string) {
  return function () {
    console.log(label);
  };
}
