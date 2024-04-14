import { Box, Divider, Text } from "@/components";
import { AddTelegramKey } from "@/keys/phone/add-telegram-key";
import { observer } from "mobx-react-lite";

import { useSecuritySettingsContext } from "../../context";

export const AddTelegramKeyPage = observer(function AddTelegramKeyPage() {
  const { draft, setKeyMetaData, popPage } = useSecuritySettingsContext();

  return (
    <Box className="h-fit w-2/5 !min-w-[320px] px-4 py-6 max-sm:w-full">
      <Text size="xl" fontWeight="semibold">
        Add a New Telegram Key
      </Text>
      <Divider className="my-2" />
      <AddTelegramKey
        onSubmit={({ publicKey, keyMetaData }) => {
          draft.value.addTelegramKey(publicKey);
          setKeyMetaData(publicKey, keyMetaData);
        }}
        onCancel={() => {
          popPage();
        }}
        askForName
      />
    </Box>
  );
});
