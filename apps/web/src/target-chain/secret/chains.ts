export enum SecretChainId {
  Secret = "cosmos:secret-4",
}

export const allSecretChains = [SecretChainId.Secret];

export function isSecretChainId(chainId: string): chainId is SecretChainId {
  return Object.values<string>(SecretChainId).includes(chainId);
}

export interface SecretChainData {
  id: SecretChainId;
  name: string;
  prefix: string;
  urls: string[];
  image: string;
  disabled?: boolean;
}

export const SecretChains: Record<SecretChainId, SecretChainData> = {
  [SecretChainId.Secret]: {
    id: SecretChainId.Secret,
    name: "Secret Network",
    urls: ["https://scrt-api.dalnim.finance", "https://scrt-api.bodhi.money/"],
    prefix: "secret",
    image:
      "https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.svg",
  },
};
