import { Box, Button, Divider, KeyListItem, Text } from "@/components";
import { HomeChain } from "@/home-chain";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { SetWalletDataUserInteraction } from "@/user-interactions/set-wallet-data-user-interaction";
import { useWalletDataFlowContext } from "@/wallet-data-flow/context";
import { observer } from "mobx-react-lite";

import { useSecuritySettingsContext } from "../context";

export const SecuritySettingsIndex = observer(function SecuritySettingsIndex() {
  const currentWallet = useCurrentWallet({});
  const { state, dispatch } = useWalletDataFlowContext();
  const { draft, keyMetaDataDraft, keyList, pushPage } =
    useSecuritySettingsContext();
  const missingMandatoryKey = !draft.value.primaryKey;

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
        <Button
          variant="secondary"
          block
          onClick={() => {
            state.onBack();
          }}
        >
          Back
        </Button>
        <Button
          variant="primary"
          block
          disabled={
            (!draft.isDirty && !keyMetaDataDraft.isDirty) || missingMandatoryKey
          }
          onClick={async () => {
            if (
              draft.value.address === draft.original.address &&
              currentWallet
            ) {
              const keyMetaData = keyMetaDataDraft.value.value;
              const wallet = await HomeChain.chainId(
                draft.value.chainId,
              ).getWalletData({
                wallet: currentWallet.toJSON(),
                keyMetaData: keyMetaDataDraft.value.value,
              });
              wallet.revision++;
              const response = await SetWalletDataUserInteraction.start({
                homeChainId: draft.value.chainId,
                owner: draft.value.toJSON()!,
                keyMetaData: keyMetaDataDraft.value.value,
                serializedWalletData: JSON.stringify(wallet),
              });
              if (response.approved) {
                currentWallet.setPreviousWalletData(wallet);
                state.onDone({
                  wallet: currentWallet.toJSON(),
                  keyMetaData,
                });
              }
            } else {
              // TODO: if the owner has not been updated, we can simplify this (only requires to sign a hash to authenticate the update)
              dispatch({
                type: "update-owner",
              });
            }
          }}
        >
          Save
        </Button>
      </div>
    </Box>
  );
});
