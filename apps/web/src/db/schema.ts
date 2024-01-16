import mongoose, { Model, Schema } from "mongoose";

export interface BackupShare {
  accountAddress: string;
  encryptionType: string;
  backupShare: string;
}

const schema = new Schema<BackupShare>({
  accountAddress: { type: String, required: true, index: true, unique: true },
  encryptionType: { type: String, required: true, index: true, unique: true },
  backupShare: { type: String, required: true, index: true, unique: true },
});

export const BackupShareModel: Model<BackupShare> =
  mongoose.models.BackupShare ??
  mongoose.model<BackupShare>("BackupShare", schema);
