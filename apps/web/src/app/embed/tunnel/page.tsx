"use client";

import { TunnelEmbed } from "@/tunnel";
import { Caip19AssetId } from "@obi-wallet/sdk-caip";
import { useSearchParams } from "next/navigation";

export default function TunnelEmbedPage() {
  const searchParams = useSearchParams();
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const from = searchParams.get("from") as Caip19AssetId | undefined;
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const to = searchParams.get("to") as Caip19AssetId | undefined;
  return <TunnelEmbed from={from} to={to} />;
}
