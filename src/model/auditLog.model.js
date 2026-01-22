import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    entity: {
      type: String,
      enum: ["TICKET", "USER"],
      required: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    action: {
      type: String,
      required: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    previousState: Object,
    newState: Object,
  },
  { timestamps: true },
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
