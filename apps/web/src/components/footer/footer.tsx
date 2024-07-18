"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { ComponentPropsWithoutRef } from "react";
import { FaXTwitter, FaTelegram, FaFileLines } from "react-icons/fa6";

import { Text } from "..";

type FooterProps = ComponentPropsWithoutRef<"footer">;

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        "flex w-full items-center pb-4 text-center",
        "justify-center",
        "md:pt-10",
        className,
      )}
    >
      <div className="bg-background-primary h-5 w-5 rounded-full" />
      <Text className="ml-3">Obi v2.1.0</Text>
      <div className="ml-4 flex flex-row space-x-4">
        <Link href="https://x.com/ObiDotMoney" target="_blank">
          <FaXTwitter width={28} height={28} color="white" />
        </Link>
        <Link href="https://t.me/obi_money" target="_blank">
          <FaTelegram width={28} height={28} color="white" />
        </Link>
        <Link href="https://docs.obi.money/" target="_blank">
          <FaFileLines width={28} height={28} color="white" />
        </Link>
      </div>
    </footer>
  );
}
