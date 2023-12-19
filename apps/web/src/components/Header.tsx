import * as React from "react";
import Typography from "./Typography";
import Button from "./buttons/Button";

export default function Header() {
  return (
    <header className="flex h-20 items-center justify-between bg-blue-600 px-8 shadow">
      <Typography
        color="white"
        size="2xl"
        fontWeight="bold"
        className="leading-3"
      >
        Obi
      </Typography>
      <Button>Log in</Button>
    </header>
  );
}
