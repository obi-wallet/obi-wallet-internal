"use client";

import { CURRENT_THEME } from "@/configs";
import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

export function MultiThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider forcedTheme={CURRENT_THEME.value}>{children}</ThemeProvider>
  );
}
