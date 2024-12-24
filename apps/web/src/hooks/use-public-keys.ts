import {
  useEd25519PublicKeyQuery,
  useSecp256k1PublicKeyQuery,
} from "@/hooks/use-public-key";
import { ObiAccountPublicKeys } from "@obi-wallet/sdk-obi-account";

export function usePublicKeys(): ObiAccountPublicKeys | undefined {
  const secp256k1 = useSecp256k1PublicKeyQuery();
  const ed25519 = useEd25519PublicKeyQuery();

  if (!secp256k1.data || ed25519.data === undefined) {
    return undefined;
  }

  return {
    secp256k1: secp256k1.data,
    ed25519: ed25519.data,
  };
}
