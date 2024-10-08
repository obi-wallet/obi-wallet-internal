"use client";

import {
  PrimaryLink,
  Text,
  Switcher,
  Table,
  Notification,
  Chart,
  Button,
  IconButton,
  Input,
  DropDown,
  DropDownOption,
  IColumn,
  IRow,
} from "@/components";
import { observer } from "mobx-react-lite";
import { FaGoogle } from "react-icons/fa";

type ColumnKey = "asset" | "meta" | "price";

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
] satisfies IColumn<ColumnKey>[];

const rows: IRow<ColumnKey>[] = [
  { asset: "ETH", meta: "Up", price: "$99.98" },
  {
    asset: "Sommelier Finance: Real Yield ETH - 14.42% ",
    meta: "Down",
    price: "$20.02",
  },
];

const options: DropDownOption<string>[] = [
  {
    value: "a",
    label: "Option A",
  },
  {
    value: "b",
    label: "Option B",
  },
];

const Homepage = observer(function Homepage() {
  return (
    <section className="flex w-full flex-col items-center justify-center space-y-9 p-5">
      <PrimaryLink href="/onboarding/introduction">
        <Text size="3xl" fontWeight="bold">
          Welcome to OBI
        </Text>
      </PrimaryLink>
      <div className="grid w-full grid-cols-12 gap-4">
        <div>
          <Switcher switched />
        </div>
        <div className="col-span-3 space-y-2">
          <div className="flex space-x-3">
            <Button>Button</Button>
            <Button disabled>Button</Button>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline">Button</Button>
            <Button variant="outline" disabled>
              Button
            </Button>
          </div>
          <div className="flex space-x-3">
            <IconButton icon={FaGoogle}>IconButton</IconButton>
            <IconButton icon={FaGoogle} disabled>
              IconButton
            </IconButton>
          </div>
          <div>
            <DropDown options={options} description="Select option" />
          </div>
        </div>
        <div className="col-span-6 space-y-3">
          <Notification
            type="warning"
            description="Sample warning description"
          />
          <Notification type="error" description="Sample error description" />
          <Notification
            type="success"
            description="Sample success description"
          />
        </div>
        <div className="col-span-2 space-y-3">
          <Input labelText="Sample input" id="input-no-icons" />
          <Input
            labelText="Sample input"
            startIcon={FaGoogle}
            id="input-with-start-icon"
          />
          <Input
            labelText="Sample input"
            endIcon={FaGoogle}
            id="input-with-end-icon"
          />
          <Input
            labelText="Sample input"
            startIcon={FaGoogle}
            endIcon={FaGoogle}
            id="input-with-both-icons"
          />
          <Input
            labelText="Disabled input"
            startIcon={FaGoogle}
            endIcon={FaGoogle}
            disabled
            id="input-disabled"
          />
        </div>
        <div className="col-span-6">
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
        </div>

        <div className="col-span-6">
          <Table columns={POSITION_COLUMNS} includeIndex rows={rows} />
        </div>
      </div>
    </section>
  );
});
export default Homepage;
