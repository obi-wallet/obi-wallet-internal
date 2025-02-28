"use client";

import { Header } from "@/components";
import { MainContainer } from "@/layouts/root";
import Image from "next/image";
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
                SECURE CRYPTO ACCESS<br />
                <span className="font-bold">for AI Agents with Guardrails</span>
              </h1>
              <p className="mt-6 text-xl font-light">
                Enable your AI agents to interact with crypto networks while maintaining security and control
              </p>
              <div className="mt-6 flex flex-col gap-5 lg:flex-row">
                <Link
                  href="https://docs.obi.money/ai-agents"
                  className="bg-primary flex items-center justify-center rounded px-10 py-5 text-xl font-normal text-[#070707] shadow"
                >
                  VIEW DOCUMENTATION
                </Link>
                <Link
                  href="https://calendly.com/obi-ai"
                  className="text-accent flex items-center justify-center rounded bg-white px-10 py-5 text-xl font-normal"
                >
                  SCHEDULE DEMO
                </Link>
              </div>
            </div>
            <div className="lg:w-1/3">
              <div className="rounded-lg bg-[#1A1A1A] p-6">
                <pre className="text-sm">
                  <code className="text-green-400">
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

          {/* Key Features */}
          <section className="flex flex-col items-center gap-16 px-6 py-12 lg:px-28">
            <h2 className="text-center text-3xl font-bold">
              Built for AI Safety
            </h2>
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon="/assets/icons/security.svg"
                title="Strict Guardrails"
                description="Set transaction limits, allowed chains, and required approval flows"
              />
              <FeatureCard
                icon="/assets/icons/audit.svg"
                title="Full Audit Trail"
                description="Track and review all AI-initiated transactions with detailed logs"
              />
              <FeatureCard
                icon="/assets/icons/control.svg"
                title="Human Oversight"
                description="Optional human approval for transactions above certain thresholds"
              />
              <FeatureCard
                icon="/assets/icons/api.svg"
                title="Simple API"
                description="Easy integration with any AI agent through our REST API"
              />
              <FeatureCard
                icon="/assets/icons/monitoring.svg"
                title="Real-time Monitoring"
                description="Monitor AI activity and set up alerts for suspicious behavior"
              />
              <FeatureCard
                icon="/assets/icons/compliance.svg"
                title="Compliance Ready"
                description="Built-in compliance tools and reporting for AI transactions"
              />
            </div>
          </section>

          {/* Safety Measures */}
          <section className="flex flex-col gap-12 px-6 py-12 lg:px-28">
            <h2 className="text-center text-3xl font-bold">Safety First Approach</h2>
            <div className="flex flex-col gap-8">
              <SafetyFeature
                number="1"
                title="Transaction Limits"
                description="Set maximum transaction amounts and daily limits for your AI agents"
              />
              <SafetyFeature
                number="2"
                title="Allowlist Control"
                description="Restrict which addresses and contracts your AI can interact with"
              />
              <SafetyFeature
                number="3"
                title="Multi-level Approval"
                description="Configure approval workflows based on transaction size and type"
              />
              <SafetyFeature
                number="4"
                title="Emergency Stop"
                description="Instantly pause all AI activity with our emergency stop feature"
              />
            </div>
          </section>

          {/* Use Cases */}
          <section className="flex flex-col items-center gap-12 px-6 py-12 lg:px-28">
            <h2 className="text-center text-3xl font-bold">AI Agent Use Cases</h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <UseCaseCard
                title="Customer Service Agents"
                description="Enable AI support agents to process refunds and resolve payment issues automatically"
              />
              <UseCaseCard
                title="Trading Bots"
                description="Let AI traders execute trades within strict parameters and risk limits"
              />
              <UseCaseCard
                title="Treasury Management"
                description="Automate treasury operations with AI while maintaining strict controls"
              />
              <UseCaseCard
                title="Reward Distribution"
                description="Automate community rewards and incentives with AI-driven distribution"
              />
            </div>
          </section>

          {/* CTA Section */}
          <section className="flex flex-col items-center gap-8 px-6 py-12 text-center lg:px-28">
            <h2 className="text-3xl font-bold">
              Ready to Empower Your AI Agents?
            </h2>
            <p className="text-xl">
              Get started with secure, controlled crypto access for your AI systems.
            </p>
            <Link
              href="https://docs.obi.money/ai-agents"
              className="bg-primary mt-4 inline-flex items-center justify-center rounded px-10 py-5 text-xl font-normal text-[#070707] shadow"
            >
              Start Integration
            </Link>
          </section>

        </section>
      </MainContainer>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-[#1A1A1A] p-6 text-center">
      <Image src={icon} alt={title} width={48} height={48} />
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

function SafetyFeature({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-[#1A1A1A] p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xl font-bold text-black">
          {number}
        </div>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}

function UseCaseCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-[#1A1A1A] p-6">
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
} 