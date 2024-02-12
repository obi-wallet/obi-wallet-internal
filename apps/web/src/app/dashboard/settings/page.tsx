"use client";
import { Box, Button, Divider, Text } from "@/components";
import Head from "next/head";

export default function Settings() {
  return (
    <>
      <Head>
        <title>Obi - Settings</title>
        <meta property="og:title" content="Obi - Settings" key="title" />
      </Head>
      <Box className="w-2/1 m-6 h-fit w-fit px-4 py-6">
        <Text size="xl">Obi Settings</Text>
        <Divider className="mt-4" />
        <div className="mt-2 space-y-2">
          <Button
            variant="secondary"
            block
            href="/dashboard/settings/account"
            className="text-xl"
          >
            Account Settings
          </Button>
          <Button
            variant="secondary"
            block
            href="/dashboard/settings/security"
            className="text-xl"
          >
            Security Settings
          </Button>
        </div>
      </Box>
    </>
  );
}
