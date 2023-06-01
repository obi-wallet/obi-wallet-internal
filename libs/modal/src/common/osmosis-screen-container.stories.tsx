import { OsmosisScreenContainer } from "@obi-wallet/common";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof OsmosisScreenContainer> = {
  title: "common/Osmosis Screen Container",
  component: OsmosisScreenContainer,
};

export default meta;

type Story = StoryObj<typeof OsmosisScreenContainer>;

export const Primary: Story = {
  render: () => {
    return (
      <OsmosisScreenContainer>
        <></>
      </OsmosisScreenContainer>
    );
  },
};
