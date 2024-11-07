import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FaPhone } from "react-icons/fa6";

import {
  CustomDropdown as Dropdown,
  CustomDropdownProps,
  DropdownItem,
  ItemComponentProps,
} from ".";

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
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story<T extends DropdownItem> = StoryObj<CustomDropdownProps<T>>;

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

export const Primary: Story<Book> = {
  args: {
    items: books,
    itemComponent: BookComponent,
    itemToString: (item) => {
      return item ? item.title : "";
    },
    selectedItemComponent: SelectedBook,
    onItemSelect: (item) => {
      console.log(item);
    },
  },
  render: (args) => {
    const [item, setItem] = useState<Book | null>(null);

    return (
      <div className="min-w-screen flex min-h-screen flex-1 items-center justify-center">
        <Dropdown<Book>
          items={books}
          className="w-full"
          itemComponent={args.itemComponent}
          itemToString={args.itemToString}
          selectedItem={item}
          onItemSelect={(item) => {
            setItem(item);
            return console.log(item);
          }}
          selectedItemComponent={args.selectedItemComponent}
        />
      </div>
    );
  },
};
