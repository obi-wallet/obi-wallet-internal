import { KeyType, MultisigKey } from "@obi-wallet/sdk";
import { Secp256k1KeyPair } from "@obi-wallet/sdk-secp256k1";

export const MOCK_PRIMARY_KEY_KEYPAIR = Secp256k1KeyPair.parse({
  privateKey: "sFlzSWG07FrZv8uQFUl0Bm0xp6noKAFz/Tsgezsrwz4=",
  publicKey: {
    type: "tendermint/PubKeySecp256k1",
    value: "AkGJdLowgIRta8alkhPRG8u1cTiX+6VnN94KcGckZdX+",
  },
});

export const MOCK_NON_PRIMARY_KEY_KEYPAIR = Secp256k1KeyPair.parse({
  privateKey: "LMG9tQFAJrGuq8pMT7jZtecewV6226I5zguHHg94qIU=",
  publicKey: {
    type: "tendermint/PubKeySecp256k1",
    value: "Ag3Rn+tkO9d8lqjd2wAQX2GVBA8ea+jGVWoNcGZ8YD4W",
  },
});

export const MOCK_MULTISIG_KEY_DATA = MultisigKey.schema.migratableSchema.parse(
  {
    keys: [
      {
        type: KeyType.Passkey,
        payload: MOCK_PRIMARY_KEY_KEYPAIR,
      },
      {
        type: KeyType.Passkey,
        payload: MOCK_NON_PRIMARY_KEY_KEYPAIR,
      },
    ],
    primaryKeyIndex: 0,
    threshold: 2,
  },
);
