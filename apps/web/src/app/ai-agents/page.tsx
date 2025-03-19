"use client";

import { Header } from "@/components";
import { MainContainer } from "@/layouts/root";
import Link from "next/link";

export default function AIAgentsPage() {
  return (
    <>
      <Header />
      <MainContainer>
        <section className="flex w-full flex-col gap-24 text-white">
          {/* Hero Section */}
          <section className="bg-background relative flex min-h-screen flex-col justify-center gap-8 px-6 py-20 text-center text-white lg:flex-row lg:items-center lg:px-28 lg:text-left">
            <div className="lg:w-2/3">
              <h1 className="text-4xl font-normal uppercase lg:text-5xl">
                SECURE CRYPTO ACCESS
                <br />
                <span className="font-bold">for AI Agents with Guardrails</span>
              </h1>
              <p className="mt-6 text-xl font-light">
                Enable your AI agents to interact with crypto networks while
                maintaining security and control
              </p>
              <div className="mt-6 flex flex-col gap-5 lg:flex-row">
                <Link
                  href="https://docs.obi.money"
                  className="bg-primary flex items-center justify-center rounded px-10 py-5 text-xl font-normal text-[#070707] shadow"
                >
                  VIEW DOCUMENTATION
                </Link>
                <Link
                  href="https://calendly.com/d/ckz4-zt7-d4k/chat-with-obi"
                  className="text-accent flex items-center justify-center rounded bg-white px-10 py-5 text-xl font-normal"
                >
                  SCHEDULE DEMO
                </Link>
              </div>
            </div>
            <div className="relative overflow-visible lg:w-1/3">
              <div className="rounded-lg bg-[#1A1A1A] p-6 lg:w-[calc(100%+50vw)] lg:rounded-r-none lg:pr-32">
                <pre className="overflow-x-auto text-sm">
                  <code className="whitespace-pre-wrap break-all text-green-400 lg:break-normal">
                    {`from obi import Digger, Chain, Token, usdc

tunnel = Digger(restrictions={
    "max_daily_volume": "50000 USDC",
    "allowed_destinations":
      [Chain.SOL, Chain.BASE, Chain.BTC]
})

deposit_address = tunnel.open({
    "from": tunnel.from(
      popcat, Chain.SOL, "1500brav"),
    "to": tunnel.to(
      usdc(Chain.BASE),
      DEST_ADDRESS
    ),
    "max_slippage": "1.50",
    "express": True,
    "status_webhook": WEBHOOK_URL
})`}
                  </code>
                </pre>
              </div>
            </div>
          </section>
        </section>
      </MainContainer>
    </>
  );
}
