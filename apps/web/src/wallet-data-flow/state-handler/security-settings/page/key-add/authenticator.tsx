import { Box, Divider, Text } from "@/components";
import { observer } from "mobx-react-lite";

import { useSecuritySettingsContext } from "../../context";
import { AddAuthenticatorKey } from "@/keys/authenticator/add-authenticator-key";

export const AddAuthenticatorKeyPage = observer(function AddTelegramKeyPage() {
  const { draft, setKeyMetaData, popPage } = useSecuritySettingsContext();

  return (
    <Box className="h-fit w-2/5 !min-w-[320px] px-4 py-6 max-sm:w-full">
      <Text size="xl" fontWeight="semibold">
        Add a New Authenticator Key
      </Text>
      <Divider className="my-2" />
      <AddAuthenticatorKey
        onSubmit={async ({ publicKey, keyMetaData }) => {
          popPage();
        }}
        onCancel={() => {
          popPage();
        }}
      />
    </Box>
  );
});
