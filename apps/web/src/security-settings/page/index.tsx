import { Box, Button, Divider, KeyListItem, Text } from "@/components";
import { useSecuritySettingsContext } from "@/security-settings/context";
import { useBackupWalletMutation } from "@/wallet-health/checks";
import { UpdateOwnerUserInteraction } from "@obi-wallet/sdk";
import { observer } from "mobx-react-lite";

export const SecuritySettingsIndex = observer(function SecuritySettingsIndex() {
  const { wallet, draft, keyList, pushPage } = useSecuritySettingsContext();
  const missingMandatoryKey = !draft.value.primaryKey;
  const backupWalletMutation = useBackupWalletMutation();

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
        {missingMandatoryKey ? (
          <Box className="mt-4 bg-red-500 text-white">
            Please add a passkey on this device to continue using your Obi
            account.
          </Box>
        ) : null}
        {keyList.map((sigKey) => (
          <KeyListItem
            key={sigKey.type}
            keyData={sigKey}
            onClick={() => {
              pushPage({
                type: "key-type",
                payload: sigKey.type,
              });
            }}
          />
        ))}
      </div>
      <div className="mt-40 grid grid-cols-2 gap-8">
        <Button variant="secondary" block href="/dashboard/settings">
          Back
        </Button>
        <Button
          variant="primary"
          block
          disabled={!draft.isDirty}
          onClick={async () => {
            const response = await UpdateOwnerUserInteraction.start({
              walletMeta: {
                userEntryAddress: wallet.userEntryAddress,
              },
              homeChainId: draft.original.chainId,
              previousOwner: draft.original.toJSON()!,
              nextOwner: draft.value.toJSON()!,
            });
            if (response.approved && response.payload.success) {
              draft.commit({ original: draft.value });
              wallet.setOwner(draft.value);
              backupWalletMutation.mutate();
            }
          }}
        >
          Save
        </Button>
      </div>
    </Box>
  );
});
