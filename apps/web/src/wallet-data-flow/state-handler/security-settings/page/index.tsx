import { Box, Divider, KeyListItem, Text } from "@/components";
import { InfoIcon } from "@/components/info-icon";
import { AsyncButton } from "@/ui/button";
import { KeyType } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useState } from "react";

import { useSecuritySettingsContext } from "../context";

const keyOptions = [
  {
    label: "Passkey",
    type: KeyType.Passkey,
    infoTopic: "passkey_info",
    infoContext: {
      type: "passkey",
      description: "A secure key stored on your device using WebAuthn",
    },
  },
  {
    label: "Telegram Key",
    type: KeyType.Telegram,
    infoTopic: "telegram_key_info",
    infoContext: {
      type: "telegram",
      description: "A key linked to your Telegram account",
    },
  },
  {
    label: "Phone Key",
    type: KeyType.Phone,
    infoTopic: "phone_key_info",
    infoContext: {
      type: "phone",
      description: "A key linked to your phone number",
    },
  },
  {
    label: "Cloud Key",
    type: KeyType.Cloud,
    infoTopic: "cloud_key_info",
    infoContext: {
      type: "cloud",
      description: "A key stored in your cloud storage",
    },
  },
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
              Keys Required to Sign: {draft.value.threshold} of{" "}
              {draft.value.keys.length}
              <InfoIcon
                topicId="keys_required_info"
                context={{
                  threshold: draft.value.threshold,
                  total: draft.value.keys.length,
                  description: "The number of keys needed to sign transactions",
                }}
              />
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
                    <InfoIcon
                      topicId={option.infoTopic}
                      context={option.infoContext}
                    />
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
