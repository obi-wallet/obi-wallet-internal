"use client";

import { ReactNode } from "react";
import { CURRENT_THEME } from "@/configs";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export function MultiThemeProvider({ children }: { children: ReactNode }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    if (CURRENT_THEME) setTheme(CURRENT_THEME.value);
  }, [CURRENT_THEME]);

  if (!CURRENT_THEME) return null;
  return <>{children}</>;
}
