// import { Secp256k1KeyPair } from "@obi-wallet/sdk";
// import mongoose, { Model, Schema } from "mongoose";

// export interface UserWorkaround {
//   userId: string;
//   zAuthKeyPair: Secp256k1KeyPair;
//   ethKeyPair: Secp256k1KeyPair;
//   evmAddress: string;
// }

// const schema = new Schema<UserWorkaround>({
//   userId: { type: String, required: true, index: true, unique: true },
//   zAuthKeyPair: {
//     publicKey: {
//       type: {
//         type: String,
//         required: true,
//       },
//       value: {
//         type: String,
//         required: true,
//       },
//     },
//     privateKey: { type: String, required: true },
//   },
//   ethKeyPair: {
//     publicKey: {
//       type: {
//         type: String,
//         required: true,
//       },
//       value: {
//         type: String,
//         required: true,
//       },
//     },
//     privateKey: { type: String, required: true },
//   },
//   evmAddress: { type: String, required: true },
// });

// export const UserModelWorkaround: Model<UserWorkaround> =
//   mongoose.models.UserWorkaround ??
//   mongoose.model<UserWorkaround>("UserWorkaround", schema);
