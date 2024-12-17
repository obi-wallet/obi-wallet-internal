import { Box, Divider, Text } from "@/components";
import { useAlert } from "@/hooks/alert";
import { AddTelegramKey } from "@/keys/phone/add-telegram-key";
import { isPublicKeyInUse } from "@/wallet-data-backup/worker-client";
import { observer } from "mobx-react-lite";

import { useSecuritySettingsContext } from "../../context";

export const AddTelegramKeyPage = observer(function AddTelegramKeyPage() {
  const { draft, setKeyMetaData, popPage } = useSecuritySettingsContext();
  const alert = useAlert();

  return (
    <Box className="h-fit w-full !min-w-[320px] py-6">
      <Text size="xl" fontWeight="semibold">
        Add a New Telegram Key
      </Text>
      <Divider className="my-2" />
      <AddTelegramKey
        onSubmit={async ({ publicKey, keyMetaData }) => {
          if (
            await isPublicKeyInUse({
              homeChainId: draft.value.chainId,
              publicKey,
            })
          ) {
            alert.showWarning(
              "This key is already used by a wallet. Please use a different Telegram Chat ID or security answer.",
            );
          } else {
            draft.value.addTelegramKey(publicKey);
            setKeyMetaData(publicKey, keyMetaData);
          }
          popPage();
        }}
        onCancel={() => {
          popPage();
        }}
        askForName
      />
    </Box>
  );
});
