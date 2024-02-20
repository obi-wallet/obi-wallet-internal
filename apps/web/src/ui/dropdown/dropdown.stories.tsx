import type { Meta, StoryObj } from "@storybook/react";

import {
  CustomDropdown as Dropdown,
  DropdownItem,
  ItemComponentProps,
} from ".";
import { FaSearch } from "react-icons/fa";
import { FaPhone } from "react-icons/fa6";
import { Button } from "@/components/buttons";
// types for books
interface Book extends DropdownItem {
  id: string;
  author: string;
  title: string;
}

const meta = {
  title: "UI/DropDown",
  component: Dropdown,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "obi",
      values: [{ name: "obi", value: "#0F0F26" }],
    },
  },
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

const BookComponent: React.FC<ItemComponentProps<Book>> = ({
  item,
  getItemProps,
  isSelected,
}) => {
  return (
    <div
      {...getItemProps({
        item,
        style: {
          backgroundColor: isSelected ? "blue" : "white",
          color: isSelected ? "white" : "black",
        },
      })}
      className="flex cursor-pointer items-center justify-between px-4 py-2"
    >
      <div className="flex items-center space-x-2">
        <FaSearch />
        <span>{item.title}</span>
      </div>
    </div>
  );
};

const SelectedBook = ({ item }: { item: Book }) => {
  return (
    <div className="flex items-center space-x-2">
      <FaPhone />
      <span>{item.title}</span>
    </div>
  );
};

export const Primary: Story = {
  args: {
    items: books,
    itemComponent: BookComponent as React.FC<ItemComponentProps<Book>>,
    selectedItemComponent: SelectedBook as React.FC<{ item: Book }>,
  },
  render: (args) => {
    return (
      <div className="w-72">
        <Dropdown
          items={books}
          itemComponent={args.itemComponent}
          onItemSelect={(item) => console.log(item)}
          selectedItemComponent={BookComponent}
        />
      </div>
    );
  },
};
