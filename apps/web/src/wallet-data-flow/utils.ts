import { SharesLocalEncryption } from "@/lib/encryption";
import { useWalletDataFlowContext } from "@/wallet-data-flow/context";
import { BackupShare, EasyShare, KeyMetaData } from "@obi-wallet/sdk";
import invariant from "tiny-invariant";

export function useFinishFlow() {
  const { state } = useWalletDataFlowContext();

  return async (payload: {
    shares?: { easy: EasyShare; backup: BackupShare };
    keyMetaData: KeyMetaData;
  }) => {
    invariant(state.walletData, "Wallet data not found");
    invariant(state.ownerDraft.value.primaryKey, "Primary key not found");

    const shares = payload.shares ?? state.shares;
    invariant(shares, "Shares not found");

    const owner = state.ownerDraft.value;
    const localEncryption = new SharesLocalEncryption(owner);
    const encryptedShares = await localEncryption.encrypt(shares);
    state.onDone({
      wallet: {
        homeChain: owner.chainId,
        owner: owner.toJSON()!,
        userEntryAddress: state.walletData.proxyAddress.address,
        encryptedShares,
      },
      keyMetaData: payload.keyMetaData,
    });
  };
}
