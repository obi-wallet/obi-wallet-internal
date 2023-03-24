import { useTheme } from "@emotion/react";
import { Text } from "@obi-wallet/common";
import {
  Chain,
  FlexAccount,
  KeyType,
  MultisigWallet,
  Sdk,
  Secp256k1PrivateKeySigner,
} from "@obi-wallet/sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Msg } from "@terra-money/feather.js";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { View } from "react-native";

import { AbstractSignatureModalProps, wrapMessages } from "./common";
import { ConfirmMessages } from "./confirm-messages";
import { SignatureModalMultisigKey } from "./multisig-key";
import { BiometricsKey } from "./terra/keys";
import { KeysList } from "../../screens/components/keys-list";

export interface SignatureModalFlexAccountProps
  extends AbstractSignatureModalProps {
  chainId: Chain;
  wallet: MultisigWallet;
  flexAccount: FlexAccount;
}

export const SignatureModalFlexAccount =
  observer<SignatureModalFlexAccountProps>(function SignatureModalFlexAccount(
    props
  ) {
    const { interaction, flexAccount, wallet } = props;
    const { payload } = interaction;
    const innerMessages = payload.messages;
    const wrappedMessages = wrapMessages({
      messages: innerMessages,
      proxyAddress: wallet.proxyAddress,
      sender: flexAccount.address,
    });

    const canExecute = useQuery({
      queryKey: ["can-execute"],
      queryFn: async () => {
        return wallet.canExecute({
          flexAccount,
          messages: innerMessages,
        });
      },
      cacheTime: 0,
    });

    if (canExecute.data === undefined) return null;

    if (canExecute.data) {
      return (
        <SignatureModalFlexAccountWithFlexAccount
          {...props}
          wrappedMessages={wrappedMessages}
        />
      );
    } else {
      return (
        <SignatureModalMultisigKey
          {...props}
          multisigKey={wallet.owner}
          proxyAddress={wallet.proxyAddress}
          safeSpendLimitExceeded
        />
      );
    }
  });

export interface SignatureModalFlexAccountWithFlexAccountProps
  extends SignatureModalFlexAccountProps {
  wrappedMessages: Msg[];
}

export const SignatureModalFlexAccountWithFlexAccount =
  observer<SignatureModalFlexAccountWithFlexAccountProps>(
    function SignatureModalFlexAccountWithFlexAccount({
      chainId,
      interaction,
      wallet,
      flexAccount,
      wrappedMessages,
    }) {
      const multisigKey = wallet.owner;
      const theme = useTheme();
      const queryClient = useQueryClient();
      const [signed, setSigned] = useState(false);

      const broadcast = useMutation({
        mutationFn: async () => {
          const sdk = Sdk.chainId(chainId);
          const signer = new Secp256k1PrivateKeySigner(flexAccount.privateKey);
          await sdk.prepareSigner({ signer });
          const signedTransaction = await sdk.createAndSignTransaction({
            signer,
            messages: wrappedMessages,
          });
          return await sdk.broadcastSignedTransactionAndLendFees({
            signedTransaction,
            sender: sdk.getAddressOfSigner({ signer }),
          });
        },
      });

      const keysData = [
        {
          type: KeyType.Device,
          signed,
          right: null,
          onPress: async () => {
            const biometricsKey = new BiometricsKey({
              multisigKey,
              queryClient,
            });

            await biometricsKey.sign(new Buffer(""));

            setSigned(true);
          },
        },
      ];

      const { payload } = interaction;

      return (
        <ConfirmMessages
          loading={broadcast.isLoading}
          cancelable={payload.cancelable}
          messages={payload.messages}
          disabled={!signed}
          onCancel={() => {
            interaction.resolve({ approved: false });
          }}
          onConfirm={async () => {
            const response = await broadcast.mutateAsync();
            interaction.resolve({ approved: true, payload: response });
          }}
        >
          <KeysList
            data={keysData}
            tiled
            animate={!signed}
            style={{
              marginVertical: 10,
              backgroundColor: "transparent",
              borderRadius: 12,
              alignItems: "center",
            }}
          />
          <View style={{ marginBottom: theme.spacing["16"] }}>
            <Text
              style={[
                theme.typography.body,
                {
                  textAlign: "center",
                  color: "#F6F5FF",
                  fontWeight: theme.fontWeights.bold,
                },
              ]}
            >
              Device Key to Confirm
            </Text>
            <Text
              style={[
                theme.typography.caption1,
                {
                  textAlign: "center",
                  color: "#F6F5FF",
                },
              ]}
            >
              Transaction only requires one signature
            </Text>
          </View>
        </ConfirmMessages>
      );
    }
  );
