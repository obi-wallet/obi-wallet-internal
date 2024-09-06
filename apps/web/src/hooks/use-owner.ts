import { HomeChain } from "@/home-chain";
import { useCurrentWallet } from "@/hooks/use-current-wallet";
import { staleTime } from "@/lib/stale-time";
import { useQuery } from "@obi-wallet/headless-ui";
import { HomeChainId, SecretJsClient } from "@obi-wallet/sdk";
import { skipToken } from "@tanstack/react-query";
import { z } from "zod";

export async function fetchOwner(wallet: {
  homeChainId: HomeChainId;
  userEntryAddress: string;
}): Promise<string> {
  const client = new SecretJsClient(wallet.homeChainId);
  const homeChain = HomeChain.chainId(wallet.homeChainId);

  const userEntryCodeHash = await homeChain.userEntryCodeHash(
    wallet.userEntryAddress,
  );
  const { userAccountAddress, userAccountCodeHash } =
    await homeChain.userAccount({
      userEntryAddress: wallet.userEntryAddress,
      userEntryCodeHash,
    });

  const { legacy_owner } = await client.queryContract({
    contract: userAccountAddress,
    codeHash: userAccountCodeHash,
    query: { legacy_owner: {} },
    schema: z.object({
      legacy_owner: z.string(),
    }),
  });
  return legacy_owner;
}

export function useOwnerQuery() {
  const wallet = useCurrentWallet({});
  return useQuery({
    queryKey: ["owner", wallet?.userEntryAddress],
    queryFn: wallet
      ? async () => {
          return await fetchOwner(wallet);
        }
      : skipToken,
    staleTime: staleTime({ minutes: 5 }),
  });
}
