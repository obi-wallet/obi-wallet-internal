import {
  Secp256k1KeyPair,
  Secp256k1PublicKey,
  SecretJsChainId,
} from "@obi-wallet/sdk";
import mongoose, { Model, Schema } from "mongoose";

export interface HomeChain {
  zAuthKeyPair: Secp256k1KeyPair;
  targetChain: {
    publicKey: Secp256k1PublicKey;
    evmAddress: string;
  };
  proxyAddress: string;
}

export interface HomeChainWithId extends HomeChain {
  chainId: SecretJsChainId;
}

export interface User {
  userId: string;
  homeChains: Map<SecretJsChainId, HomeChain>;
}

const schema = new Schema<User>({
  userId: { type: String, required: true, index: true, unique: true },
  homeChains: {
    type: Map,
    required: true,
    of: {
      zAuthKeyPair: {
        publicKey: {
          type: {
            type: String,
            required: true,
          },
          value: {
            type: String,
            required: true,
          },
        },
        privateKey: { type: String, required: true },
      },
      targetChain: {
        publicKey: {
          type: {
            type: String,
            required: true,
          },
          value: {
            type: String,
            required: true,
          },
        },
        evmAddress: {
          type: String,
          required: true,
        },
      },
      proxyAddress: { type: String, required: true },
    },
  },
});

export const UserModel: Model<User> =
  mongoose.models.User ?? mongoose.model<User>("User", schema);
