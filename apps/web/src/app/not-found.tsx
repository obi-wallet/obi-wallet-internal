"use client";
import Danger from "@/alert/danger.json";
import Lottie from "lottie-react";

export default function NotFound() {
  return (
    <div className="m-auto text-center text-white">
      <Lottie animationData={Danger} loop={false} height={300} width={300} />
      <h1 className="mb-4 text-4xl">404 | Not Found</h1>
      <p>Could not find requested resource</p>
    </div>
  );
}
