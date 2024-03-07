import { dashboardLayoutDecorator } from "@/storybook-helpers/layouts";
import type { Meta, StoryObj } from "@storybook/react";
import { FaSearch } from "react-icons/fa";
import { FaPhone } from "react-icons/fa6";

import {
  CustomDropdown as Dropdown,
  DropdownItem,
  ItemComponentProps,
} from ".";
// types for books
interface Book extends DropdownItem {
  id: string;
  author: string;
  title: string;
}

const meta = {
  title: "UI/Dropdown",
  component: Dropdown,
  parameters: {
    layout: "centered",
  },
  decorators: [dashboardLayoutDecorator],
  tags: ["autodocs"],
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const books: Book[] = [
  { id: "book-1", author: "Harper Lee", title: "To Kill a Mockingbird" },
  { id: "book-2", author: "Lev Tolstoy", title: "War and Peace" },
  { id: "book-3", author: "Fyodor Dostoyevsy", title: "The Idiot" },
  { id: "book-4", author: "Oscar Wilde", title: "A Picture of Dorian Gray" },
  { id: "book-5", author: "George Orwell", title: "1984" },
  { id: "book-6", author: "Jane Austen", title: "Pride and Prejudice" },
  { id: "book-7", author: "Marcus Aurelius", title: "Meditations" },
  {
    id: "book-8",
    author: "Fyodor Dostoevsky",
    title: "The Brothers Karamazov",
  },
  { id: "book-9", author: "Lev Tolstoy", title: "Anna Karenina" },
  { id: "book-10", author: "Fyodor Dostoevsky", title: "Crime and Punishment" },
];

function BookComponent({
  item,
  getItemProps,
  isSelected,
}: ItemComponentProps<Book>) {
  return (
    <div
      {...(getItemProps({
        item,
        style: {
          backgroundColor: isSelected ? "blue" : "white",
          color: isSelected ? "white" : "black",
        },
      }) as React.HTMLAttributes<HTMLDivElement>)}
      className="flex cursor-pointer items-center justify-between px-4 py-2"
    >
      <div className="flex items-center space-x-2">
        <FaSearch />
        <span>{item.title}</span>
      </div>
    </div>
  );
}

function SelectedBook({ item }: { item: Book | null }) {
  if (!item) {
    return <div>Choose a book</div>;
  }
  return (
    <div className="flex items-center space-x-2">
      <FaPhone />
      <span>{item.title}</span>
    </div>
  );
}

export const Primary: Story = {
  args: {
    items: books,
    itemComponent: BookComponent as unknown as React.FC<
      ItemComponentProps<DropdownItem>
    >,
    itemToString: (item) => (item ? (item as Book).title : ""),
    selectedItemComponent: SelectedBook as React.FC<{
      item: DropdownItem | null;
    }>,
  },
  render: (args) => {
    return (
      <div className="min-w-screen flex min-h-screen flex-1 items-center justify-center">
        <Dropdown
          items={books}
          className="w-full"
          itemComponent={args.itemComponent}
          itemToString={args.itemToString}
          onItemSelect={(item) => console.log(item)}
          selectedItemComponent={args.selectedItemComponent}
        />
      </div>
    );
  },
};
