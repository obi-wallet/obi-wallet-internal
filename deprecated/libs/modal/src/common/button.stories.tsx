import { Button, OsmosisScreenContainer } from "@obi-wallet/common";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Button> = {
  title: "common/Button",
  component: Button,
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  render: () => {
    return (
      <OsmosisScreenContainer>
        <Button label="Primary" flavor="primary" />
        <Button label="Primary disabled" flavor="primary" disabled />
        <Button label="Cancel" flavor="cancel" />
        <Button label="Cancel disabled" flavor="cancel" disabled />
      </OsmosisScreenContainer>
    );
  },
};
