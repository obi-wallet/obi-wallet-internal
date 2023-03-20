import { SinglesigWalletSchema } from "./schema";
import { Secp256k1PublicKey } from "../../keys";
import { AbstractSerialized } from "../migratable";

export interface SinglesigWalletInterface {
  readonly schema: typeof SinglesigWalletSchema;
  readonly type: "singlesig-wallet";
  readonly publicKey: Secp256k1PublicKey;
  readonly privateKey: string;

  toJSON(): AbstractSerialized<typeof SinglesigWalletSchema>;
}
