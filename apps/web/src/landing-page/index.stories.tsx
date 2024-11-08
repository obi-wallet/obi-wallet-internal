import { Meta, StoryObj } from "@storybook/react";

import { LandingPage } from ".";

const meta = {
  title: "Pages/Landing Page",
  component: LandingPage,
} satisfies Meta<typeof LandingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LandingPageStory: Story = {
  name: "Landing Page",
};
