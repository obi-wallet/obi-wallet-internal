import { HomeChain } from "@/home-chain";
import { SharesLocalEncryption } from "@/lib/encryption";
import { KeyMetaData } from "@/stores/key-meta-data";
import { useWalletDataFlowContext } from "@/wallet-data-flow/context";
import { BackupShare, EasyShare } from "@obi-wallet/sdk";
import invariant from "tiny-invariant";

export function useFinishFlow() {
  const { state } = useWalletDataFlowContext();

  return async (payload: {
    shares?: { easy: EasyShare; backup: BackupShare };
    keyMetaData: KeyMetaData;
    backupWallet?: boolean;
  }) => {
    invariant(state.walletData, "Wallet data not found");
    invariant(state.ownerDraft.value.primaryKey, "Primary key not found");

    const shares = payload.shares ?? state.shares;
    invariant(shares, "Shares not found");

    const owner = state.ownerDraft.value;
    const localEncryption = new SharesLocalEncryption(owner);
    const encryptedShares = await localEncryption.encrypt(shares);

    const wallet = {
      homeChain: owner.chainId,
      owner: owner.toJSON()!,
      userEntryAddress: state.walletData.proxyAddress.address,
      encryptedShares,
    };

    if (payload.backupWallet && !state.mockOnly) {
      await HomeChain.chainId(wallet.homeChain).backupWallet({
        wallet,
        keyMetaData: payload.keyMetaData,
      });
    }

    state.onDone({
      wallet,
      keyMetaData: payload.keyMetaData,
    });
  };
}
