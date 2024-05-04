"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
const ReactApexChart = dynamic(
  () => {
    return import("react-apexcharts");
  },
  {
    ssr: false,
  },
);

const options: ApexOptions = {
  legend: {
    show: false,
    position: "top",
    horizontalAlign: "left",
  },
  chart: {
    height: 335,
    type: "line",
    stacked: false,
  },
  stroke: {
    curve: "smooth",
  },
  dataLabels: {
    enabled: false,
  },

  fill: {
    type: "solid",
    colors: ["transparent"],
  },
};

interface ChartState {
  name: string;
  data: number[];
}

export function Chart({ series }: { series: ChartState[] }) {
  return (
    <div className="pt-7.5 shadow-default h-96 w-full rounded-sm bg-transparent px-5 pb-5 ">
      <ReactApexChart
        options={options}
        series={series}
        type="area"
        width="100%"
        height="100%"
      />
    </div>
  );
}
