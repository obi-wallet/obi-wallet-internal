import mongoose from "mongoose";
import invariant from "tiny-invariant";

import { UserModel } from "./schema";
import { UserModelWorkaround } from "./schema-workaround";

export async function connect() {
  invariant(process.env.MONGODB_URI, "MONGODB_URI is not set");
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "production",
  });
  return UserModel;
}

export async function connectWorkaround() {
  invariant(process.env.MONGODB_URI, "MONGODB_URI is not set");
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "production",
  });
  return UserModelWorkaround;
}
