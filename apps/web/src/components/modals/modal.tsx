"use client";

import { ReactNode } from "react";

import { Box, Divider, Text } from "..";
import { FaTimes } from "react-icons/fa";

export function Modal({
  children,
  title,
  onClose,
}: {
  children: ReactNode;
  title: string;
  onClose?: () => void;
}) {
  return (
    <div className="absolute top-0 flex h-full w-full items-center justify-center bg-black/30 backdrop-blur-sm ">
      <Box className="relative w-[560px] space-y-4 pt-6 shadow-lg shadow-neutral-600 max-sm:w-[400px]">
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
            <FaTimes className=" text-white" />
          </button>
        )}
      </Box>
    </div>
  );
}
