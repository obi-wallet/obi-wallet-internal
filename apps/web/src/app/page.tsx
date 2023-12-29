import { PrimaryLink, Text, Switcher, Table } from "@/components";
import { Chart } from "@/components/chart";

const POSITION_COLUMNS = [
  { value: "asset", label: "Asset", style: "justify-start" },
  {
    value: "meta",
    label: "Meta",
  },
  {
    value: "price",
    label: "Price",
  },
];

interface IRow {
  asset: string;
  meta: string;
  price: string;
}

export default function Homepage() {
  const rows: IRow[] = [
    { asset: "ETH", meta: "Up", price: "$99.98" },
    {
      asset: "Sommelier Finance: Real Yield ETH - 14.42% ",
      meta: "Down",
      price: "$20.02",
    },
  ];

  return (
    <section className="flex w-full flex-col items-center justify-center space-y-9">
      <PrimaryLink href="/onboarding/introduction">
        <Text size="3xl" fontWeight="bold">
          Welcome to OBI
        </Text>
      </PrimaryLink>
      <div className="w-full space-y-5">
        <Switcher switched />
        <Chart
          series={[
            {
              name: "BTC",
              data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 45],
            },

            {
              name: "ETH",
              data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 51],
            },
          ]}
        />

        <Table columns={POSITION_COLUMNS} includeIndex rows={rows} />
      </div>
    </section>
  );
}
