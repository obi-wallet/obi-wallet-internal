"use client";
import { Box, Button, Divider, KeyItem, KeyListItem, Text } from "@/components";
import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { KeyType, MultisigKey } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

export default observer(function SecuritySettings() {
  const currentWallet = useCurrentWallet({});
  const draftId = `security-${currentWallet?.userEntryAddress}`;
  const { draftsStore, keyMetaDataStore } = useStore();
  const draft = draftsStore.get<MultisigKey>({ id: draftId });

  useEffect(() => {
    if (!draft && currentWallet) {
      draftsStore.create({
        id: draftId,
        original: currentWallet.owner,
      });
    }
  }, [currentWallet, draft, draftId, draftsStore]);

  if (!currentWallet || !draft) return null;

  const keyMetaData = keyMetaDataStore.getKeyMetaData(
    currentWallet.userEntryAddress,
  );

  function getKeysOfType(type: KeyType) {
    if (!draft) return [];
    return draft.value.getKeysOfType(type).map((key) => {
      const id = key.publicKey.value;
      return {
        id: key.publicKey.value,
        label: keyMetaData[id]?.name ?? "Passkey",
      };
    });
  }

  const keyList: KeyItem[] = [
    {
      type: KeyType.Passkey,
      label: "Passkey",
      mandatory: true,
      keys: getKeysOfType(KeyType.Passkey),
    },
    {
      type: KeyType.Phone,
      label: "Phone Key",
      keys: getKeysOfType(KeyType.Phone),
    },
    {
      type: KeyType.Telegram,
      label: "Telegram Key",
      keys: getKeysOfType(KeyType.Telegram),
    },
  ];

  const missingManadatoryKey = keyList.find(
    (item) => item.mandatory && item.keys.length === 0,
  );

  return (
    <Box className="h-fit w-2/5 !min-w-[320px] px-4 py-6 max-sm:w-full">
      <Text size="xl" fontWeight="semibold">
        Security Settings
      </Text>
      <Text size="sm" fontWeight="light" className="mt-3">
        Add keys to your account. Click any of the options below to update or
        add keys to your account.
      </Text>
      <Box className="bg-background-select mt-3 flex flex-col justify-between gap-2">
        <Text size="sm" fontWeight="medium" color="white">
          My Accounts
        </Text>
        <div className="flex flex-row justify-between">
          <Text size="sm" fontWeight="light" color="zinc">
            Keys Required To Sign
          </Text>
          <Text size="sm" fontWeight="semibold" color="white">
            {`${draft.value.threshold} of ${draft.value.keys.length}`}
          </Text>
        </div>
      </Box>
      <Divider className="my-2" />

      <div className="space-y-2">
        {missingManadatoryKey ? (
          <Box className="mt-4 bg-red-500">
            {`Please add a ${missingManadatoryKey.label.toLocaleLowerCase()} on this device to continue using your Obi account.`}
          </Box>
        ) : null}
        {keyList.map((sigKey) => (
          <KeyListItem
            key={sigKey.type}
            keyData={sigKey}
            href={`/dashboard/settings/security/${sigKey.type}`}
          />
        ))}
      </div>
      <div className="mt-40 grid grid-cols-2 gap-8">
        <Button variant="secondary" block href="/dashboard/settings">
          Back
        </Button>
        <Button variant="primary" block disabled={!draft.isDirty}>
          Save
        </Button>
      </div>
    </Box>
  );
});
