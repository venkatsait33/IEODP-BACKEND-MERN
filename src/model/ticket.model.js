import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    status: {
      type: String,
      enum: [
        "SUBMITTED",
        "FORWARDED_TO_MANAGEMENT",
        "ACTION_TAKEN",
        "REVERIFY",
        "CLOSED",
      ],
      default: "SUBMITTED",
    },

    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      operator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      leadership: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      management: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },

    auditor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    auditorDecision: {
      type: String,
      enum: ["APPROVED", "REJECTED", "REVERIFY"],
      default: null,
    },
    tags: {
      type: [String],
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

export const Ticket = mongoose.model("Ticket", ticketSchema);
