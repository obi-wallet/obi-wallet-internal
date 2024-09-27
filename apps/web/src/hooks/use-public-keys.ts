import {
  useEd25519PublicKeyQueryOptions,
  useSecp256k1PublicKeyQueryOptions,
} from "@/hooks/use-public-key";
import { ObiAccountPublicKeys } from "@obi-wallet/sdk-obi-account";
import { useQueries } from "@tanstack/react-query";

export function usePublicKeys() {
  const secp256k1PublicKeyQuery = useSecp256k1PublicKeyQueryOptions();
  const ed25519PublicKeyQuery = useEd25519PublicKeyQueryOptions();
  return useQueries({
    queries: [secp256k1PublicKeyQuery, ed25519PublicKeyQuery],
    combine: (results): ObiAccountPublicKeys | undefined => {
      const secp256k1 = results[0].data;
      const ed25519 = results[1].data;

      if (!secp256k1 || !ed25519) {
        return undefined;
      }

      return {
        secp256k1,
        ed25519,
      };
    },
  });
}
