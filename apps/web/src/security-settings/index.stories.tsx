import { SecuritySettings } from "@/security-settings/index";
import { providerWithWalletDecorator } from "@/storybook-helpers";
import { dashboardLayoutDecorator } from "@/storybook-helpers/layouts";
import { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Security Settings",
  component: SecuritySettings,
  decorators: [dashboardLayoutDecorator, providerWithWalletDecorator],
} satisfies Meta<typeof SecuritySettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
};
