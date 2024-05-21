import { Box, Divider, Text } from "@/components";
import { AlertType } from "@/components/custom-alert";
import { useAlert } from "@/hooks/alert";
import { AddPhoneKey } from "@/keys/phone/add-phone-key";
import { isPublicKeyInUse } from "@/wallet-data-backup/worker-client";
import { observer } from "mobx-react-lite";

import { useSecuritySettingsContext } from "../../context";

export const AddPhoneKeyPage = observer(function AddPhoneKeyPage() {
  const { draft, setKeyMetaData, popPage } = useSecuritySettingsContext();
  const alert = useAlert();

  return (
    <Box className="h-fit w-2/5 !min-w-[320px] px-4 py-6 max-sm:w-full">
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
            alert.showAlert(
              "This key is already used by a wallet. Please use a different phone number or security answer.",
              AlertType.WARNING,
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
