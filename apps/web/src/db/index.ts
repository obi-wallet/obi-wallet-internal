import mongoose from "mongoose";
import invariant from "tiny-invariant";

import { BackupShareModel } from "./schema";

export async function connect() {
  invariant(process.env.MONGODB_URI, "MONGODB_URI is not set");
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "production",
  });
  return BackupShareModel;
}
