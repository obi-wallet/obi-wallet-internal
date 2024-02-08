"use client";

import { ReactNode } from "react";

import { Box, Divider, Text } from "..";

export function Modal({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="absolute top-0 flex h-full w-full items-center justify-center bg-black/30 backdrop-blur-sm ">
      <Box className="w-[560px] space-y-4 pt-6 shadow-lg shadow-neutral-600 max-sm:w-[400px]">
        <Text size="xl">{title}</Text>
        <Divider />
        {children}
      </Box>
    </div>
  );
}
