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
  },
  { timestamps: true },
);

export const Ticket = mongoose.model("Ticket", ticketSchema);
