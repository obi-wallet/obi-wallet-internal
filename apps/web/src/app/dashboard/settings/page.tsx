"use client";
import { Box, Button, Divider, Text } from "@/components";
import { useStore } from "@/contexts";
import Head from "next/head";
import { useRouter } from "next/navigation";

export default function Settings() {
  const { mpcWalletsStore } = useStore();
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Obi - Settings</title>
        <meta property="og:title" content="Obi - Settings" key="title" />
      </Head>
      <Box className="w-2/1 h-fit w-fit px-4 py-6">
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
          <Button
            variant="secondary"
            block
            href="/dashboard/settings/import-token"
            className="text-xl"
          >
            Import Token
          </Button>
          <Button
            variant="secondary"
            block
            onClick={() => {
              mpcWalletsStore.logout();
              router.push("/");
            }}
            className="text-xl md:hidden"
          >
            Log out
          </Button>
        </div>
      </Box>
    </>
  );
}
