import { Roboto_Mono } from "next/font/google";
import localFont from "next/font/local";

export const pressStart2P = localFont({
  src: [
    {
      path: "../assets/fonts/press-start-2p-regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/press-start-2p-regular.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/press-start-2p-regular.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-press-start-2p",
});

export const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["100", "400", "500", "700"],
  variable: "--font-roboto-mono",
  display: "swap",
});
