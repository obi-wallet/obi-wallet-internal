import { useStore } from "@/contexts";
import { useAlert } from "@/hooks/alert";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { isSecretChainId } from "@/target-chain/secret/chains";
import { SecretMpcSigner } from "@/target-chain/secret/mpc-signer";
import { Encoding } from "@obi-wallet/encoding";
import { SignAndBroadcastTransactionUserInteraction } from "@obi-wallet/sdk";
import { Caip19AssetId, parseCaip19AssetId } from "@obi-wallet/sdk-caip";
import { MsgExecuteContract } from "secretjs";
import invariant from "tiny-invariant";

export function useCreateViewingKey() {
  const wallet = useCurrentWallet();
  const { viewingKeysStore } = useStore();
  const alert = useAlert();

  return async (assetId: Caip19AssetId) => {
    const { chainId, reference } = parseCaip19AssetId(assetId);

    invariant(wallet, "No wallet found");
    invariant(isSecretChainId(chainId), "Chain is not a secret chain");

    const signer = await SecretMpcSigner.fromWallet(wallet, chainId);

    const accounts = await signer.getAccounts();
    const firstAccount = accounts[0];
    invariant(firstAccount, "No account found");

    const random = new Uint8Array(32);
    crypto.getRandomValues(random);
    const key = Encoding.fromBytes(random).toHex();
    const message = new MsgExecuteContract({
      sender: firstAccount.address,
      contract_address: reference,
      msg: {
        set_viewing_key: {
          key,
        },
      },
    });

    const response = await SignAndBroadcastTransactionUserInteraction.start({
      messages: [message],
      memo: "",
      cancelable: true,
      targetChainId: chainId,
      walletMeta: {
        id: wallet.id,
      },
    });

    if (response.approved) {
      const broadcastResult = response.payload;
      if (broadcastResult.success) {
        viewingKeysStore.setViewingKey({
          id: wallet.id,
          assetId,
          key,
        });
        alert.showSuccess("TX broadcast successfully");
      } else {
        alert.showError(`TX failed: ${broadcastResult.rawLog}`);
      }
    }
  };
}
