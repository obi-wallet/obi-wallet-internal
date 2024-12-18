import { Box, Button, Divider, Text } from "@/components";
import { useStore } from "@/contexts";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { useGoogleAuth } from "@/hooks/use-google-auth";
import { cn } from "@/lib/utils";
import { AsyncButton } from "@/ui/button";
import { KeyType } from "@obi-wallet/sdk";
import { generateSecp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";
import { DateTime } from "luxon";
import { observer } from "mobx-react-lite";
import { FaTrash } from "react-icons/fa";

import { KeyTypePage, useSecuritySettingsContext } from "../context";

export const SecuritySettingsKeyTypePage = observer<{ page: KeyTypePage }>(
  function SecuritySettingsKeyTypePage({ page }) {
    const { draft, keyList, pushPage, popPage, setKeyMetaData } =
      useSecuritySettingsContext();
    const { uploadFile } = useGoogleAuth();
    const { userDataStore } = useStore();
    const currentWallet = useCurrentWallet();
    const keyData = keyList.find((item) => {
      return item.type === page.payload;
    });

    if (!keyData || !currentWallet) return null;

    const userData = userDataStore.getUserData(currentWallet.userEntryAddress);
    const walletName = userData.name || "My Obi";
    const safeWalletName = walletName.replace(/[^a-zA-Z0-9-_ ]/g, "").trim();

    return (
      <Box className="h-fit !min-w-full py-6 max-sm:w-full">
        <Text size="xl" fontWeight="semibold">
          {`${keyData.label} Settings`}
        </Text>
        <Text size="sm" fontWeight="light" className="mt-3">
          {`Update or name your ${keyData.type} keys.`}
        </Text>
        <Divider className="my-2" />
        <div className="space-y-2">
          {keyData.keys.map((sigKey) => {
            const disabled =
              keyData.possiblePrimaryKey && keyData.keys.length === 1;

            return (
              <div key={sigKey.id} className="relative flex">
                <Button
                  className="relative border-none"
                  variant="secondary"
                  block
                  textAlign="left"
                  onClick={() => {
                    pushPage({
                      type: "key-item",
                      payload: sigKey,
                    });
                  }}
                >
                  {sigKey.label}
                </Button>
                <button
                  className={cn(
                    "absolute right-0 flex h-full w-14 items-center justify-center rounded-r bg-red-500 hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-600 disabled:opacity-30",
                  )}
                  disabled={disabled}
                  onClick={() => {
                    draft.value.removeKey(sigKey.key);
                  }}
                >
                  <FaTrash className="h-4 w-4" color="white" />
                </button>
              </div>
            );
          })}
        </div>
        <AsyncButton
          variant="outline"
          block
          className="mt-6 border-dashed"
          onClick={async () => {
            if (page.payload === KeyType.Cloud) {
              const keyPair = generateSecp256k1KeyPair();
              const cloudkey = draft.value.addCloudKey(keyPair.publicKey);
              if (!draft.value.primaryKey) {
                draft.value.setPrimaryKey(cloudkey);
              }
              const timestamp = DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm");
              const fileName = `obi-${safeWalletName}-${timestamp}.key`;
              setKeyMetaData(keyPair.publicKey, {
                name: `obi-${safeWalletName}-${timestamp}`,
                timestamp,
              });
              await uploadFile(keyPair, fileName, "application/json");
            } else {
              pushPage({
                type: "key-add",
                payload: page.payload,
              });
            }
          }}
        >
          Add New Key
        </AsyncButton>
        <div className="mt-40 grid grid-cols-2 gap-8">
          <Button
            variant="secondary"
            block
            onClick={() => {
              popPage();
            }}
          >
            Back
          </Button>
          <Button
            variant="primary"
            block
            onClick={() => {
              popPage();
            }}
            disabled={!draft.isDirty}
          >
            Next
          </Button>
        </div>
      </Box>
    );
  },
);
