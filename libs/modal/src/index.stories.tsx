import type { Meta, StoryObj } from "@storybook/react";

function Foo() {
  return <div>Foo</div>;
}

const meta: Meta<typeof Foo> = {
  title: "Foo",
  component: Foo,
};

export default meta;

type Story = StoryObj<typeof Foo>;

export const Bar: Story = {
  render: () => <Foo />,
};
