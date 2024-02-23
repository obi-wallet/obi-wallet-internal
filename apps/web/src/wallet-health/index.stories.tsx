import { providerWithWalletDecorator } from "@/storybook-helpers";
import { HealthChecks } from "@/wallet-health/index";
import { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Wallet Health",
  component: HealthChecks,
} satisfies Meta<typeof HealthChecks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HealthChecksStory: Story = {
  name: "HealthChecks",
  decorators: [providerWithWalletDecorator],
};
