import { Box, Divider, KeyListItem, Text } from "@/components";
import { AsyncButton } from "@/ui/button";
import { KeyType } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FaTrash } from "react-icons/fa";

import { useSecuritySettingsContext } from "../context";

const keyOptions = [
  { label: "Passkey", type: KeyType.Passkey },
  { label: "Telegram Key", type: KeyType.Telegram },
  { label: "Phone Key", type: KeyType.Phone },
  { label: "Cloud Key", type: KeyType.Cloud },
];

export const SecuritySettingsIndex = observer(function SecuritySettingsIndex() {
  const { state, dispatch, draft, keyMetaDataDraft, keyList, pushPage } =
    useSecuritySettingsContext();
  const [showAddKeyOptions, setShowAddKeyOptions] = useState(false);
  const missingPrimaryKey = !draft.value.primaryKey;
  const activeKeys = keyList.filter((sigKey) => {
    return sigKey.keys.length > 0;
  });

  return (
    <Box className="h-fit !min-w-[320px] pb-6 max-sm:w-full">
      {/* Header */}
      <div className="flex items-start justify-start self-stretch rounded-[5px] bg-[#32c9af] p-2.5">
        <Text size="xl" fontWeight="normal" className="text-[#070707]">
          {showAddKeyOptions ? "Add New Key" : "Security Settings"}
        </Text>
      </div>
      {!showAddKeyOptions ? (
        <>
          {/* Description */}
          <div className="flex items-center justify-start self-stretch px-2.5">
            <Text fontWeight="normal" className="mb-1 mt-1 text-sm text-white">
              Update, remove or add keys to your account.
            </Text>
          </div>
          {/* Keys Required */}
          <Divider className="my-2 opacity-0" />
          <div className="flex items-center justify-center self-stretch px-2.5">
            <Text
              size="sm"
              fontWeight="normal"
              className="text-center text-[#32c9af]"
            >
              {`Keys Required to Sign: ${draft.value.threshold} of ${draft.value.keys.length}`}
            </Text>
          </div>
        </>
      ) : (
        <>
          {/* Description */}
          <div className="flex items-center justify-center self-stretch px-2.5 py-10">
            <Text size="sm" fontWeight="normal" className="text-white">
              Select the new key type below.
            </Text>
          </div>
          {/* Key Type Options */}
          <div className="w-full space-y-2">
            {keyOptions.map((option) => {
              return (
                <AsyncButton
                  key={option.type}
                  variant="secondary"
                  textAlign="justify"
                  className="flex w-full"
                  onClick={async () => {
                    pushPage({
                      type: "key-type",
                      payload: option.type,
                    });
                  }}
                >
                  <Text size="lg" fontWeight="normal" className="text-left">
                    {option.label}
                  </Text>
                  <Text size="lg" fontWeight="normal" className="text-right">
                    +
                  </Text>
                </AsyncButton>
              );
            })}
          </div>
        </>
      )}
      <Divider className="my-2 opacity-0" />
      <div className="space-y-2">
        {missingPrimaryKey ? (
          <Box className="mt-4 bg-red-500 text-white">
            Please add a primary key on this device to continue using your Obi
            account.
          </Box>
        ) : null}
        {!showAddKeyOptions &&
          activeKeys.map((sigKey) => {
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
        {/* Add New Key Button */}
        {!showAddKeyOptions && (
          <AsyncButton
            variant="outline"
            textAlign="justify"
            className="add-new-key-btn mt-4 flex w-full items-center self-stretch rounded-[5px] border border-[#32c9af] p-2.5"
            onClick={async () => {
              setShowAddKeyOptions(true);
            }}
          >
            <Text size="md" fontWeight="normal" className="text-white">
              Add New Key
            </Text>
            <Text size="lg" fontWeight="normal" className="text-white">
              +
            </Text>
          </AsyncButton>
        )}
      </div>
      {/* Back and Save Buttons */}
      <div className="mt-4 flex items-start justify-start gap-2.5 self-stretch">
        {/* Back Button */}
        {showAddKeyOptions && (
          <AsyncButton
            variant="secondary"
            className="flex flex-1 items-center justify-center self-stretch rounded-[5px] border border-[#32c9af] px-[5px]"
            onClick={async () => {
              setShowAddKeyOptions(false);
            }}
          >
            <Text size="xl" fontWeight="normal" className="text-white">
              Back
            </Text>
          </AsyncButton>
        )}
        {/* Save Button */}
        <AsyncButton
          variant="primary"
          className="flex h-[46px] flex-1 items-center justify-center rounded-[5px] bg-[#32c9af] p-2.5"
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
          <Text size="xl" fontWeight="normal" className="text-white">
            Save
          </Text>
        </AsyncButton>
      </div>
    </Box>
  );
});
