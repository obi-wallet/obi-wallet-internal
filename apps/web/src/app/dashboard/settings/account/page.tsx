"use client";

import { Box, Button, Divider, ImageDropzone, Text } from "@/components";
import { useStore } from "@/contexts";
import { HomeChain } from "@/home-chain";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { UserData } from "@/stores";
import { Input } from "@/ui/input";
import { observer } from "mobx-react-lite";
import { useState } from "react";

export default observer(function AccountSettings() {
  const wallet = useCurrentWallet({});
  const { userDataStore } = useStore();

  if (!wallet) return null;

  const userData = userDataStore.getUserData(wallet.userEntryAddress);

  return (
    <Form
      userData={userData}
      onSave={async (userData) => {
        userDataStore.setUserData(wallet.userEntryAddress, userData);
        await HomeChain.chainId(wallet.homeChainId).backupWallet({
          wallet: wallet.toJSON(),
          userData: {
            name: userData.name ?? "",
            avatar: userData.avatar ?? "",
          },
        });
      }}
    />
  );
});

function Form({
  userData,
  onSave,
}: {
  userData: UserData;
  onSave(userData: UserData): void;
}) {
  const [name, setName] = useState(userData.name ?? "");
  const [avatar, setAvatar] = useState(userData.avatar ?? "");

  return (
    <Box className="w-2/1 h-fit w-fit px-4 py-6 max-sm:w-full">
      <Text size="xl">Account Settings</Text>
      <Divider className="my-4" />
      <div className="mt-3 space-y-3">
        <Input
          label="Name"
          labelClassname="bg-background-secondary"
          className="w-96 max-sm:w-full"
          placeholder="Name"
          value={name}
          onChange={(value) => {
            setName(value);
          }}
        />

        <ImageDropzone
          placeholder="Upload Picture"
          onChange={(_, fileBody) => {
            setAvatar(fileBody);
          }}
        />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-8">
        <Button variant="secondary" block href="/dashboard/settings">
          Back
        </Button>
        <Button
          variant="primary"
          block
          onClick={() => {
            onSave({
              name,
              avatar,
            });
          }}
        >
          Save
        </Button>
      </div>
    </Box>
  );
}
