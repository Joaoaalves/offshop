import mongoose, { Schema, Document } from "mongoose";
export type { UserRole } from "@/types/roles";
export { USER_ROLES, USER_ROLE_LABELS } from "@/types/roles";
import type { UserRole } from "@/types/roles";
import { USER_ROLES } from "@/types/roles";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, default: "analyst" },
  },
  { timestamps: true },
);

export const User =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
