import { Box, Divider, KeyListItem, Text } from "@/components";
import { AsyncButton } from "@/ui/button";
import { observer } from "mobx-react-lite";

import { useSecuritySettingsContext } from "../context";

export const SecuritySettingsIndex = observer(function SecuritySettingsIndex() {
  const { state, dispatch, draft, keyMetaDataDraft, keyList, pushPage } =
    useSecuritySettingsContext();
  const missingPrimaryKey = !draft.value.primaryKey;

  return (
    <Box className="h-fit w-2/5 !min-w-[320px] px-4 py-6 max-sm:w-full">
      <Text size="xl" fontWeight="semibold">
        Security Settings
      </Text>
      <Text size="sm" fontWeight="light" className="mt-3" leading="normal">
        Add keys to your account. Click any of the options below to update or
        add keys to your account.
      </Text>
      <Box className="bg-background-select mt-3 flex flex-row justify-between gap-2">
        <Text size="sm" fontWeight="semibold" color="white">
          Keys Required To Sign
        </Text>
        <Text size="sm" fontWeight="semibold" color="white">
          {`${draft.value.threshold} of ${draft.value.keys.length}`}
        </Text>
      </Box>
      <Divider className="my-2" />

      <div className="space-y-2">
        {missingPrimaryKey ? (
          <Box className="mt-4 bg-red-500 text-white">
            Please add a primary key on this device to continue using your Obi
            account.
          </Box>
        ) : null}
        {keyList.map((sigKey) => {
          return (
            <KeyListItem
              key={sigKey.type}
              keyData={sigKey}
              alert={missingPrimaryKey && sigKey.possiblePrimaryKey}
              onClick={() => {
                pushPage({
                  type: "key-type",
                  payload: sigKey.type,
                });
              }}
            />
          );
        })}
      </div>
      <div className="mt-40 flex justify-center gap-8">
        {/* <Button
          variant="secondary"
          block
          onClick={() => {
            state.onBack();
          }}
        >
          Back
        </Button> */}
        <AsyncButton
          variant="primary"
          block
          disabled={
            (!draft.isDirty && !keyMetaDataDraft.isDirty) || missingPrimaryKey
          }
          onClick={async () => {
            await dispatch(
              state.commitDraft({
                walletData: state.walletData,
                ownerDraft: draft,
                keyMetaDataDraft: keyMetaDataDraft,
              }),
            );
          }}
        >
          Save
        </AsyncButton>
      </div>
    </Box>
  );
});
