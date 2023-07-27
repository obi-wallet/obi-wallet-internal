import mongoose, { Schema } from "mongoose";

export interface User {
  userId: string;
  publicKey: string;
  privateKey: string;
  proxyAddress: string;
}

const schema = new Schema<User>({
  userId: { type: String, required: true, index: true, unique: true },
  publicKey: { type: String, required: true },
  privateKey: { type: String, required: true },
  proxyAddress: { type: String, required: true },
});

export const UserModel =
  mongoose.models.User ?? mongoose.model<User>("User", schema);
