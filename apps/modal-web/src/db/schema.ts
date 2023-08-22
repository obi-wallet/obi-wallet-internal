import mongoose, { Schema } from "mongoose";

export interface User {
  userId: string;
  homePublicKey: string;
  homePrivateKey: string;
  proxyAddress: string;
}

const schema = new Schema<User>({
  userId: { type: String, required: true, index: true, unique: true },
  homePublicKey: { type: String, required: true },
  homePrivateKey: { type: String, required: true },
  proxyAddress: { type: String, required: true },
});

export const UserModel =
  mongoose.models.User ?? mongoose.model<User>("User", schema);
