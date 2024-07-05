"use client";

import { Box, Input, Button } from "@/components";
import { observer } from "mobx-react-lite";

export default observer(function ImportNewAsset() {

  return (
    <div className="w-full ">
      <Box className="w-full lg:w-1/2 ">
        <div>
          <div className="flex-1 text-white text-center my-4">Import New Asset</div>
          <div className="my-4">
            <label className="text-sm text-white">Token contract address</label>
            <Input
              className="mt-2 px-3 py-3 text-sm"
            />
          </div>
          <div className="my-4">
            <label className="text-sm text-white">Token Symbol</label>
            <Input
              className="mt-2 px-3 py-3 text-sm"
            />
          </div>
          <div className="my-4">
            <label className="text-sm text-white">Token Decimal</label>
            <Input
              className="mt-2 px-3 py-3 text-sm"
            />
          </div>
          <div className="mb-4 mt-0.5 flex gap-8 text-white">
            <Button
              href="/dashboard"
              className="flex-1 justify-center rounded-lg border-blue-500 bg-transparent p-2 text-center"
            >
              Cancel
            </Button>
            <Button
              href=""
              className="flex-1 justify-center rounded-lg p-2"
            >
              Import
            </Button>
        </div>
        </div>
      </Box>
    </div>
  );
});

