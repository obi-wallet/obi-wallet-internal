import { Box } from "@/components";

// import wizardImage from "~/assets/images/Obi Wizard.png";
export default function Homepage() {
  return (
    <div className="grid h-full grid-rows-3 gap-4 px-7 py-5 text-white">
      <Box title="Applications" />
      <Box title="Chart" />
      <Box title="Top Positions" />
    </div>
  );
}
