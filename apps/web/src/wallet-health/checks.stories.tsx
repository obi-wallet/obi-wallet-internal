import {
  AutomatedTest,
  automatedTestPlay,
  providerWithWalletDecorator,
} from "@/storybook-helpers";
import {
  usePublicKeyKnownCheck,
  useWalletBackupCheck,
} from "@/wallet-health/checks";
import { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Tests/wallet-health/checks",
  component: AutomatedTest,
} satisfies Meta<typeof AutomatedTest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UsePublicKeyKnownCheck: Story = {
  name: "usePublicKeyKnownCheck",
  decorators: [providerWithWalletDecorator],
  render: function UsePublicKeyKnownCheckTest() {
    const check = usePublicKeyKnownCheck();
    return (
      <AutomatedTest
        done={check.query.isSuccess || check.query.isError}
        success={check.query.isSuccess && !!check.query.data}
      />
    );
  },
  play: automatedTestPlay,
};

export const UseWalletBackupCheck: Story = {
  name: "useWalletBackupCheck",
  decorators: [providerWithWalletDecorator],
  render: function UseWalletBackupCheckTest() {
    const check = useWalletBackupCheck();

    return (
      <AutomatedTest
        done={check.query.isSuccess || check.query.isError}
        success={check.query.isSuccess && !!check.query.data}
      />
    );
  },
  play: automatedTestPlay,
};
