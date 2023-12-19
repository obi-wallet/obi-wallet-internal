"use client";
import * as React from "react";
import Typography from "./Typography";

import { FaXTwitter, FaTelegram, FaFileLines } from "react-icons/fa6";
export default function Footer() {
  return (
    <footer className="flex items-center px-10 py-9">
      <div className="h-5 w-5 rounded-full bg-blue-600" />
      <Typography className="ml-3">Obi v2.0.0</Typography>
      <div className="ml-4 flex flex-row space-x-4">
        <FaXTwitter width={28} height={28} color="white" />
        <FaTelegram width={28} height={28} color="white" />
        <FaFileLines width={28} height={28} color="white" />
      </div>
    </footer>
  );
}
