import { Button } from "@/components/buttons";
import type { Meta, StoryObj } from "@storybook/react";
import { FaSearch } from "react-icons/fa";
import { FaPhone } from "react-icons/fa6";

import { Input, InputProps } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "obi",
      values: [{ name: "obi", value: "#0F0F26" }],
    },
  },
  tags: ["autodocs"],
  argTypes: {
    label: { type: "string" },
    labelClassname: {
      type: "string",
      description:
        "Additional classes for the label. To display the label correctly, it is required to pass the background, such as `bg-black`",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    label: "Label",
    labelClassname: "bg-black",
    placeholder: "Placeholder",
  },
};

export const WithRightComponent: Story = {
  args: {
    label: "Label",
    labelClassname: "bg-black",
    placeholder: "Placeholder",
  },
  render: (args) => (
    <Input
      {...args}
      rightComponent={<FaSearch className="ml-1 text-white" />}
    />
  ),
};
export const WithLeftComponent: Story = {
  args: {
    label: "Label",
    labelClassname: "bg-black",
    placeholder: "Placeholder",
  },
  render: (args) => (
    <Input {...args} leftComponent={<FaPhone className="mr-2 text-white" />} />
  ),
};

export const WithLeftIconAndRightButton: Story = {
  args: {
    label: "Label",
    labelClassname: "bg-black",
    placeholder: "Placeholder",
  },
  render: (args) => (
    <div className=" w-96">
      <Input
        {...args}
        leftComponent={<FaPhone className="mr-2 text-white" />}
        rightComponent={
          <Button onClick={() => alert("clicked!")} className="ml-2">
            save
          </Button>
        }
      />
    </div>
  ),
};
export const withChildren = {
  args: {
    label: "Label",
    labelClassname: "bg-black",
    placeholder: "Placeholder",
  },
  render: (args: JSX.IntrinsicAttributes & InputProps) => (
    <Input {...args}>
      <div className="text-white">you can add children here</div>
    </Input>
  ),
};
export const withTopComponent = {
  args: {
    label: "Label",
    labelClassname: "bg-black",
    placeholder: "Placeholder",
  },
  render: (args: JSX.IntrinsicAttributes & InputProps) => (
    <div>
      <Input
        {...args}
        topComponent={
          <div className="absolute right-2 top-2 text-red-700">required</div>
        }
      />
      <Input
        {...args}
        topComponent={
          <div className="  w-full  text-left text-xs">
            <span className=" text-gray-500">100 SAT</span>
          </div>
        }
        rightComponent={
          <div className="w-32">
            <Button>Some Asset</Button>
          </div>
        }
        value="10"
        className="mt-4"
      />
    </div>
  ),
};
