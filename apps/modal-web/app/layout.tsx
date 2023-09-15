import { ReactNode } from "react";

export const metadata = {
  title: "Welcome to Obi Modal",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // Override console.log based on DEV environment variable
  if (process.env.DEV !== 'true') {
    console.log = function() {}; // Empty function to suppress logs
  }
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
