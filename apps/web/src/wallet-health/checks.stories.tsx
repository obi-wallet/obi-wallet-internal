import {
  AutomatedTest,
  automatedTestPlay,
  providerWithWalletDecorator,
} from "@/storybook-helpers";
import {
  useEd25519PublicKeyKnownCheck,
  useOwnerUpToDateCheck,
  useSecp256k1PublicKeyKnownCheck,
  useWalletBackupCheck,
  useWalletBackupIncludesEasyShareCheck,
} from "@/wallet-health/checks";
import { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "Tests/wallet-health/checks",
  component: AutomatedTest,
} satisfies Meta<typeof AutomatedTest>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UseSecp256k1PublicKeyKnownCheck: Story = {
  name: "useSecp256k1PublicKeyKnownCheck",
  decorators: [providerWithWalletDecorator],
  render: function UsePublicKeyKnownCheckTest() {
    const check = useSecp256k1PublicKeyKnownCheck();
    return (
      <AutomatedTest
        done={check.query.isSuccess || check.query.isError}
        success={check.query.isSuccess && !!check.query.data}
      />
    );
  },
  play: automatedTestPlay,
};

export const UseEd25519PublicKeyKnownCheck: Story = {
  name: "useEd25519PublicKeyKnownCheck",
  decorators: [providerWithWalletDecorator],
  render: function UsePublicKeyKnownCheckTest() {
    const check = useEd25519PublicKeyKnownCheck();
    return (
      <AutomatedTest
        done={check.query.isSuccess || check.query.isError}
        success={check.query.isSuccess && !!check.query.data}
      />
    );
  },
  play: automatedTestPlay,
};

export const UseOwnerUpToDateCheck: Story = {
  name: "useOwnerUpToDateCheck",
  decorators: [providerWithWalletDecorator],
  render: function UseOwnerUpToDateCheckTest() {
    const check = useOwnerUpToDateCheck();
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

export const UseWalletBackupIncludesEasyShareCheck: Story = {
  name: "useWalletBackupIncludesEasyShareCheck",
  decorators: [providerWithWalletDecorator],
  render: function UseWalletBackupCheckTest() {
    const check = useWalletBackupIncludesEasyShareCheck();

    return (
      <AutomatedTest
        done={check.query.isSuccess || check.query.isError}
        success={check.query.isSuccess && !!check.query.data}
      />
    );
  },
  play: automatedTestPlay,
};
