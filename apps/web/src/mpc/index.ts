import { Encoding, HexEncodedString } from "@obi-wallet/encoding";
import { Parameters as KeygenParam } from "@obi-wallet/mpc-ecdsa-wasm-types";
import {
  BackupShare,
  EasyShare,
  NetworkShare,
  Secp256k1PublicKey,
} from "@obi-wallet/sdk";

export interface DistributeSharesResponse {
  keygenParam: KeygenParam;
  backupParticipants: number[];
  networkParticipants: number[];
  easyShare: EasyShare;
  backupShare: BackupShare;
  networkShare: NetworkShare;
}

export function easyShareToSecp256k1PublicKey(
  easyShare: EasyShare,
): Secp256k1PublicKey {
  return {
    type: "tendermint/PubKeySecp256k1",
    value: Encoding.fromHex(
      HexEncodedString.parse(easyShare.preSignForBackupShare.pubkey.point),
    ).toBase64(),
  };
}

export function getDefaultMpcParams() {
  const keygenParam: KeygenParam = { parties: 3, threshold: 1 };
  const networkParticipants: number[] = [1, 3];
  const backupParticipants: number[] = [2, 3];

  return { keygenParam, networkParticipants, backupParticipants };
}

export function decryptedSharesToDistributeSharesResponse({
  easyShare,
  backupShare,
  networkShare,
}: {
  easyShare: EasyShare;
  backupShare: BackupShare;
  networkShare: NetworkShare;
}): DistributeSharesResponse {
  return {
    ...getDefaultMpcParams(),
    easyShare,
    backupShare,
    networkShare,
  };
}
