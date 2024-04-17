"use client";

import { Box, Button, Divider, Text } from "@/components";

import { Input } from "@/ui/input";
import { observer } from "mobx-react-lite";

export default observer(function ImportToken() {
  const isTokenFound = false;

  return (
    <Box className="h-fit w-2/5 !min-w-[320px] px-4 py-6 max-sm:w-full">
      <Text size="xl" fontWeight="semibold">
        Import Token
      </Text>
      <Text size="sm" fontWeight="light" className="mt-3" leading="normal">
        Enter the contract address of the token you would like to display below.
        Please note that some tokens exist on multiple chains.
      </Text>
      <Divider className="my-2" />
      <div className="mt-4 space-y-4">
        <Input
          label="Token Contract Address"
          labelClassname="bg-background-secondary"
          className="w-full"
          placeholder=""
        />
        <Text
          size="sm"
          fontWeight="light"
          color={isTokenFound ? "lime" : "red"}
          leading="normal"
          className="mb-2 ml-2"
        >
          {isTokenFound
            ? "Token Found!"
            : "No token found associated with contract."}
        </Text>
        <Input
          label="Token Symbol"
          labelClassname="bg-background-secondary"
          className="w-full"
          placeholder=""
        />
        <Input
          label="Network"
          labelClassname="bg-background-secondary"
          className="w-full"
          placeholder=""
        />
      </div>
      <div className="mt-8 grid grid-cols-2 gap-8">
        <Button variant="secondary" block href="/dashboard/settings">
          Back
        </Button>
        <Button variant="primary" block onClick={async () => {}}>
          Save
        </Button>
      </div>
    </Box>
  );
});
