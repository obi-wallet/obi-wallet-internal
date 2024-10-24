import {
  HomeChainId,
  KeyType,
  MultisigKey,
  ObservableMultisigKey,
  WalletData,
} from "@obi-wallet/sdk";

export function walletDataToMultisigKey({
  homeChainId,
  wallet,
}: {
  homeChainId: HomeChainId;
  wallet: WalletData;
}): MultisigKey {
  const multisigKey = ObservableMultisigKey.create(homeChainId);
  wallet.owner.keys.forEach((key) => {
    switch (key.type) {
      case KeyType.Passkey:
        multisigKey.addPasskeyKey(key.publicKey);
        break;
      case KeyType.Phone:
        multisigKey.addPhoneKey(key.publicKey);
        break;
      case KeyType.Telegram:
        multisigKey.addTelegramKey(key.publicKey);
        break;
      case KeyType.Cloud:
        multisigKey.addCloudKey(key.publicKey);
        break;
    }
  });
  return multisigKey;
}
