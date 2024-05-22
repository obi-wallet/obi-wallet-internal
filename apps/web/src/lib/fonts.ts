import localFont from "next/font/local";

export const PressStart2P = localFont({
  src: [
    {
      path: "../assets/fonts/PressStart2P-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/PressStart2P-Regular.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/PressStart2P-Regular.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-Press-Start-2P",
});
