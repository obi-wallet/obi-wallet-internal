import { Meta, StoryObj } from "@storybook/react";

import { LandingPageInner } from ".";

const meta = {
  title: "Pages/Landing Page",
  component: LandingPageInner,
} satisfies Meta<typeof LandingPageInner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LandingPageStory: Story = {
  name: "Landing Page",
};
