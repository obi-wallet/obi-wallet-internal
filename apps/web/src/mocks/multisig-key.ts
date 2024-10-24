import { KeyType, MultisigKeySchema } from "@obi-wallet/sdk";
import { Secp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";

export const MOCK_PRIMARY_KEY_KEYPAIR = Secp256k1KeyPair.parse({
  privateKey: "SD133G9x6ApXbUKYHMyMDFH+6pa6JB6BRrD2Ufd3v30=",
  publicKey: {
    type: "tendermint/PubKeySecp256k1",
    value: "AxakNsuvFvIHV9rsSMKxLi/yb6mCS09YQ06hM69mKedP",
  },
});

export const MOCK_RECOVERY_KEY_KEYPAIR = Secp256k1KeyPair.parse({
  privateKey: "LMG9tQFAJrGuq8pMT7jZtecewV6226I5zguHHg94qIU=",
  publicKey: {
    type: "tendermint/PubKeySecp256k1",
    value: "Ag3Rn+tkO9d8lqjd2wAQX2GVBA8ea+jGVWoNcGZ8YD4W",
  },
});

export const MOCK_MULTISIG_KEY_DATA = MultisigKeySchema.parse({
  keys: [
    {
      type: KeyType.Passkey,
      publicKey: MOCK_PRIMARY_KEY_KEYPAIR.publicKey,
    },
    {
      type: KeyType.Telegram,
      publicKey: MOCK_RECOVERY_KEY_KEYPAIR.publicKey,
    },
  ],
  primaryKeyIndex: 0,
  threshold: 2,
});
