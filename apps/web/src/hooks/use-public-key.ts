import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { staleTime } from "@/lib/stale-time";
import { concat, Encoding, HexWithoutPrefix } from "@obi-wallet/encoding";
import { useQuery } from "@obi-wallet/headless-ui";
import {
  HomeChainId,
  SecretJsClient,
  SecretJsHomeChains,
} from "@obi-wallet/sdk";
import { Secp256k1PublicKey } from "@obi-wallet/sdk-secp256k1";
import invariant from "tiny-invariant";

export async function fetchPublicKey(wallet: {
  homeChainId: HomeChainId;
  userEntryAddress: string;
}): Promise<Secp256k1PublicKey> {
  const client = new SecretJsClient(wallet.homeChainId);
  const chain = SecretJsHomeChains[wallet.homeChainId];

  const response = await client.queryContract({
    contract: chain.secretSigner.address,
    codeHash: chain.secretSigner.codeHash,
    query: {
      passport_pubkey: { user_entry_address: wallet.userEntryAddress },
    },
    schema: HexWithoutPrefix,
  });

  return {
    type: "tendermint/PubKeySecp256k1",
    value: Encoding.fromHexWithoutPrefix(
      // Append missing first byte
      concat(HexWithoutPrefix.parse("04"), response),
    ).toBase64(),
  };
}

export function usePublicKeyQuery() {
  const wallet = useCurrentWallet({});
  return useQuery({
    queryKey: ["public-key", wallet?.userEntryAddress],
    queryFn: async () => {
      invariant(wallet, "Expected wallet to be set.");
      return await fetchPublicKey(wallet);
    },
    enabled: !!wallet,
    staleTime: staleTime({ minute: 5 }),
  });
}

export function usePublicKey() {
  return usePublicKeyQuery().data;
}
