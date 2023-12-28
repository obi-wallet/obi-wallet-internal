"use client";
import { useState } from "react";

export const Switcher = ({
  switched,
  onSwitch,
}: {
  switched: boolean;
  onSwitch?: (value: boolean) => void;
}) => {
  const [enabled, setEnabled] = useState<boolean>(switched);

  return (
    <div>
      <label
        htmlFor="toggle1"
        className="flex cursor-pointer select-none items-center"
      >
        <div className="relative">
          <input
            type="checkbox"
            id="toggle1"
            className="sr-only"
            onChange={() => {
              const nextState = !enabled;
              setEnabled(nextState);
              onSwitch && onSwitch(nextState);
            }}
          />
          <div className="bg-meta-9 block h-8 w-14 rounded-full border  border-zinc-800 bg-slate-950"></div>
          <div
            className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition ${
              enabled && "!right-1 !translate-x-full !bg-blue-600 "
            }`}
          ></div>
        </div>
      </label>
    </div>
  );
};
