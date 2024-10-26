"use client";

import { DangerAnimation } from "@/animations/danger";

export default function NotFound() {
  return (
    <div className="m-auto text-center text-white">
      <DangerAnimation height={300} width={300} />
      <h1 className="mb-4 text-4xl">404 | Not Found</h1>
      <p>Could not find requested resource</p>
    </div>
  );
}
