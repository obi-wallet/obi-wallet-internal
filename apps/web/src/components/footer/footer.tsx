"use client";

import { cn } from "@/lib/utils";
import { ComponentPropsWithoutRef } from "react";
import { FaXTwitter, FaTelegram, FaFileLines } from "react-icons/fa6";

import { Text } from "..";

type FooterProps = ComponentPropsWithoutRef<"footer">;

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        "flex w-full items-center px-10 py-9",
        "max-sm:justify-center",
        className,
      )}
    >
      <div className="bg-background-primary h-5 w-5 rounded-full" />
      <Text className="ml-3">Obi v2.0.0</Text>
      <div className="ml-4 flex flex-row space-x-4">
        <FaXTwitter width={28} height={28} color="white" />
        <FaTelegram width={28} height={28} color="white" />
        <FaFileLines width={28} height={28} color="white" />
      </div>
    </footer>
  );
}
