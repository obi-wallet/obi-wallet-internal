import { Box, Divider, Text } from "@/components";
import { useAlert } from "@/hooks/alert";
import { AddPhoneKey } from "@/keys/phone/add-phone-key";
import { isPublicKeyInUse } from "@/wallet-data-backup/worker-client";
import { observer } from "mobx-react-lite";

import { useSecuritySettingsContext } from "../../context";

export const AddPhoneKeyPage = observer(function AddPhoneKeyPage() {
  const { draft, setKeyMetaData, popPage } = useSecuritySettingsContext();
  const alert = useAlert();

  return (
    <Box className="h-fit w-full !min-w-[320px] py-6">
      <Text size="xl" fontWeight="semibold">
        Add a New Phone Key
      </Text>
      <Divider className="my-2" />
      <AddPhoneKey
        onSubmit={async ({ publicKey, keyMetaData }) => {
          if (
            await isPublicKeyInUse({
              homeChainId: draft.value.chainId,
              publicKey,
            })
          ) {
            alert.showWarning(
              "This key is already used by a wallet. Please use a different phone number or security answer.",
            );
          } else {
            draft.value.addPhoneKey(publicKey);
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
