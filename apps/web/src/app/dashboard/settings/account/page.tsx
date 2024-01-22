"use client";
import { Box, Button, Divider, ImageDropzone, Input, Text } from "@/components";
import { ChangeEvent } from "react";

export default function Settings() {
  return (
    <Box className="w-2/1 m-6 h-fit w-fit px-4 py-6">
      <Text size="xl">Account Settings</Text>
      <Divider className="my-4" />
      <div className="mt-3 space-y-3">
        <Input
          className="w-96"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {}}
          placeholder="Name"
          labelBgColor="bg-slate-900"
        />

        <ImageDropzone
          placeholder="Upload Picture"
          onChange={(_, fileBody) => {}}
        />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-8">
        <Button variant="secondary" block href="/dashboard/settings">
          Back
        </Button>
        <Button variant="primary" block>
          Save
        </Button>
      </div>
    </Box>
  );
}
