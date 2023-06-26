import { ReactNode } from "react";

export const metadata = {
  title: "Welcome to Obi Modal",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
