import { Box } from "@/components";

export default function Dashboard() {
  return (
    <div className="grid h-full w-full grid-rows-3 gap-4 px-7 py-5 text-white">
      <Box title="Applications" />
      <Box title="Chart" />
      <Box title="Top Positions" />
    </div>
  );
}
