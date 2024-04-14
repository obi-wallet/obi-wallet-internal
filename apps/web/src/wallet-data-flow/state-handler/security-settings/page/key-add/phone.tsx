import { Box, Divider, Text } from "@/components";
import { AddPhoneKey } from "@/keys/phone/add-phone-key";
import { observer } from "mobx-react-lite";

import { useSecuritySettingsContext } from "../../context";

export const AddPhoneKeyPage = observer(function AddPhoneKeyPage() {
  const { draft, setKeyMetaData, popPage } = useSecuritySettingsContext();

  return (
    <Box className="h-fit w-2/5 !min-w-[320px] px-4 py-6 max-sm:w-full">
      <Text size="xl" fontWeight="semibold">
        Add a New Phone Key
      </Text>
      <Divider className="my-2" />
      <AddPhoneKey
        onSubmit={({ publicKey, keyMetaData }) => {
          draft.value.addPhoneKey(publicKey);
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
