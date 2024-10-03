import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { MultisigKeyEncryption, SharesLocalEncryption } from "@/lib/encryption";
import { KeyMetaData } from "@/stores/key-meta-data";
import { useWalletDataFlowContext } from "@/wallet-data-flow/context";
import {
  BackupShare,
  EasyShare,
  MpcWallet,
  Serialized,
  UserEntryAddress,
  WalletData,
} from "@obi-wallet/sdk";
import { Ed25519KeyPair } from "@obi-wallet/sdk-ed25519";
import invariant from "tiny-invariant";

export function useGetWallet() {
  const { state } = useWalletDataFlowContext();

  return async function getWallet(payload: {
    shares: { easy: EasyShare; backup: BackupShare };
    ed25519KeyPair: Ed25519KeyPair | null;
  }): Promise<Serialized<MpcWallet>> {
    invariant(state.walletData, "Wallet data not found");

    const shares = payload.shares;

    const owner = state.ownerDraft.value;
    const localEncryption = new SharesLocalEncryption(owner);
    const multisigKeyEncryption = new MultisigKeyEncryption(owner.publicKey);
    const [encryptedShares, encryptedPrivateKey] = await Promise.all([
      localEncryption.encrypt(shares),
      ...(payload.ed25519KeyPair
        ? [multisigKeyEncryption.encrypt(payload.ed25519KeyPair.privateKey)]
        : []),
    ]);

    return {
      homeChain: owner.chainId,
      owner: owner.toJSON()!,
      userEntryAddress: UserEntryAddress.parse(
        state.walletData.userEntryAddress,
      ),
      previousWalletData: state.walletData,
      encryptedShares,
      ed25519KeyPair:
        payload.ed25519KeyPair && encryptedPrivateKey
          ? {
              publicKey: payload.ed25519KeyPair.publicKey.value,
              encryptedPrivateKey,
            }
          : null,
    };
  };
}

export function useFinishFlow() {
  const wallet = useCurrentWallet({});
  const { state } = useWalletDataFlowContext();
  const getWallet = useGetWallet();

  return async (payload: {
    shares?: { easy: EasyShare; backup: BackupShare };
    ed25519KeyPair: Ed25519KeyPair | null;
    keyMetaData: KeyMetaData;
    walletData?: WalletData;
  }) => {
    invariant(state.walletData, "Wallet data not found");
    invariant(state.ownerDraft.value.primaryKey, "Primary key not found");

    async function getWalletData(): Promise<Serialized<MpcWallet>> {
      const shares = payload.shares ?? state.shares;

      if (!shares) {
        invariant(wallet, "No shares available, expected wallet to be set");
        return wallet.toJSON();
      }

      return await getWallet({
        shares,
        ed25519KeyPair: payload.ed25519KeyPair,
      });
    }

    const walletData = await getWalletData();
    if (payload.walletData) {
      walletData.previousWalletData = payload.walletData;
    }

    state.onDone({
      wallet: walletData,
      keyMetaData: payload.keyMetaData,
    });
  };
}
