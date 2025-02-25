export enum BitcoinChainId {
  Bitcoin = "bip122:000000000019d6689c085ae165831e93",
  BitcoinTestnet = "bip122:000000000933ea01ad0ee984209779ba",
}

export const allBitcoinChains = [
  BitcoinChainId.Bitcoin,
  BitcoinChainId.BitcoinTestnet,
];

export function isBitcoinChainId(chainId: string): chainId is BitcoinChainId {
  return Object.values<string>(BitcoinChainId).includes(chainId);
}

export interface BitcoinChainData {
  id: BitcoinChainId;
  name: string;
  image: string;
  disabled?: boolean;
}

export const BitcoinChains: Record<BitcoinChainId, BitcoinChainData> = {
  [BitcoinChainId.Bitcoin]: {
    id: BitcoinChainId.Bitcoin,
    name: "Bitcoin",
    image:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png",
  },
  [BitcoinChainId.BitcoinTestnet]: {
    id: BitcoinChainId.BitcoinTestnet,
    name: "Bitcoin Testnet",
    image:
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/bitcoin/info/logo.png",
  },
};
