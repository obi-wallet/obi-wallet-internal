export interface CurrentAccountMeta {
  type: "flex-account" | "singlesig-wallet";
  id: string;
}

export interface WalletMeta {
  walletId: string;
  currentAccount: CurrentAccountMeta | null;
}
