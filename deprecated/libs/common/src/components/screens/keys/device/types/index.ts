import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { z } from "zod";

import { KeyFlow, KeyRoute, KeyStackParamList } from "../../../../../router";
import { SerializedProxyWallet } from "../../../lookup-proxy-wallets/api-types";

export type DeviceKeyScreenProps = NativeStackScreenProps<
  KeyStackParamList,
  KeyRoute.DeviceKey
>;

export interface DeviceKeyProps {
  draftId: string;
  demoMode: boolean;
  onSubmit(
    userSaysDeviceIsNew: boolean,
    deviceOrUnityPubkeyBase64: string,
  ): void;
  flow: KeyFlow;
}

// TODO: remove it from here and make it accessible on a higher level

export const Secp256k1PublicKey = z.object({
  type: z.literal("tendermint/PubKeySecp256k1"),
  value: z.string(),
});

export type Secp256k1PublicKey = z.infer<typeof Secp256k1PublicKey>;

export const Sec256k1PrivateKey = z.string();

export type Sec256k1PrivateKey = z.infer<typeof Sec256k1PrivateKey>;

export interface Secp256k1KeyPair {
  publicKey: Secp256k1PublicKey;
  privateKey: Sec256k1PrivateKey;
}

export type BiometricsData = Promise<{
  wallets?: SerializedProxyWallet[] | undefined;
  deviceKeypair?: Secp256k1KeyPair | undefined;
  success?: boolean | undefined;
  newUser?: boolean | undefined;
}>;
