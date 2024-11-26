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
    <div className="text-roboto-mono absolute top-0 z-50 flex h-full w-full md:items-center md:justify-center bg-black/30 backdrop-blur-sm">
      <Box
        className={cn(
          "relative w-[560px] max-md:w-[90%] lg:w-[400px] space-y-4 pt-6 shadow-lg shadow-neutral-600 max-sm:w-[400px]",
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
