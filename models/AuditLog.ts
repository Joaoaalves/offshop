import mongoose, { Schema } from "mongoose";

export interface IAuditLog {
  userId: string;
  userName: string;
  userEmail: string;
  method: string;   // POST | PUT | PATCH | DELETE
  path: string;     // e.g. /api/self-products/abc123
  action: string;   // e.g. products:write
  resourceId?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId:    { type: String, required: true, index: true },
    userName:  { type: String, required: true },
    userEmail: { type: String, required: true },
    method:    { type: String, required: true },
    path:      { type: String, required: true },
    action:    { type: String, required: true, index: true },
    resourceId: { type: String },
    meta:      { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    // Cap at 50k docs (~10 MB) so it never grows unbounded
    capped: { max: 50_000, size: 10_485_760 },
  },
);

export const AuditLog =
  mongoose.models.AuditLog ??
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
