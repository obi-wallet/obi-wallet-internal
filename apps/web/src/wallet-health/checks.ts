import { usePublicKeyQuery } from "@/hooks/use-public-key";
import { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

export interface WalletHealthCheck {
  /** Query should return a truthy value if the check passes. */
  query: UseQueryResult;
  /** Message to display if the check fails */
  message: string;
  /** An optional mutation that fixes the problem */
  resolve?: UseMutationResult;
}

export function usePublicKeyKnownCheck(): WalletHealthCheck {
  const query = usePublicKeyQuery();
  // TODO: to resolve, execute set_shares with multisigkey owner
  // See also /api/setup/distribute-shares
  // Transacting with the multisig owner has not been implemented yet, but will also be required for updating owner.

  return {
    query,
    message: "Secret signer has no public key for this wallet.",
  };
}
