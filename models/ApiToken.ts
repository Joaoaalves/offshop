import { model, models, Schema } from "mongoose";

export interface IApiToken {
  _id: string;
  name: string;
  /** SHA-256 hash of the raw token — never stored in plain text */
  tokenHash: string;
  /** First 12 chars of the raw token for display (e.g. "offs_a1b2c3d4") */
  prefix: string;
  createdBy: string;
  createdAt: Date;
  lastUsedAt?: Date;
}

const ApiTokenSchema = new Schema<IApiToken>(
  {
    name: { type: String, required: true },
    tokenHash: { type: String, required: true, unique: true },
    prefix: { type: String, required: true },
    createdBy: { type: String, required: true },
    lastUsedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const ApiToken =
  models.ApiToken || model<IApiToken>("ApiToken", ApiTokenSchema);
