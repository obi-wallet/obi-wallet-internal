"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { FaTimes } from "react-icons/fa";

import { Box, Divider, Text } from "..";

export function Modal({
  children,
  title,
  onClose,
  boxClassname,
}: {
  children: ReactNode;
  title: string;
  onClose?: () => void;
  boxClassname?: string;
}) {
  return (
    <div className="bg-background/30 absolute top-0 z-50 flex h-full w-full backdrop-blur-sm md:items-center md:justify-center">
      <Box
        className={cn(
          "relative w-[560px] space-y-4 pt-6 shadow-lg shadow-neutral-600 max-md:w-[90%] max-sm:w-[400px] lg:w-[400px]",
          boxClassname,
        )}
      >
        <Text size="xl">{title}</Text>
        <Divider />
        {children}

        {onClose && (
          <button
            className="absolute right-4 top-0 pb-4 pl-4"
            onClick={() => {
              onClose();
            }}
          >
            <FaTimes className="text-white" />
          </button>
        )}
      </Box>
    </div>
  );
}
