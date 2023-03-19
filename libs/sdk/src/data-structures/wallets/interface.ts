import { WalletsSchema } from "./schema";
import { Serialized } from "../abstract";
import { AbstractSerialized } from "../migratable";
import { MultisigWallet } from "../multisig-wallet";

export interface WalletsInterface {
  readonly wallets: ReadonlyArray<MultisigWallet>;
  readonly currentWallet: MultisigWallet | null;

  toJSON(): AbstractSerialized<typeof WalletsSchema>;
  setCurrentWallet(wallet: MultisigWallet): void;
  logout(): void;
  getWallet(id: string): MultisigWallet | undefined;
  upsertWallet(serialized: Serialized<MultisigWallet>): MultisigWallet;
  removeWallet(wallet: MultisigWallet): void;
}
