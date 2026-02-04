import mongoose from "mongoose";

const ticketActionSchema = new mongoose.Schema(
  {
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      enum: ["operator", "leadership", "management", "auditor"],
      required: true,
      lowercase: true,
    },

    actionType: {
      type: String,
      enum: [
        "CREATED",
        "LEADERSHIP_REVIEW",
        "MANAGEMENT_ACTION",
        "AUDITOR_APPROVED",
        "AUDITOR_REJECTED",
        "AUDITOR_REVERIFY",
        "REVERIFY_RESPONSE",
        "TICKET_ASSIGNED",
      ],
      required: true,
    },

    comment: {
      type: String,
    },

    previousStatus: String,
    newStatus: String,
  },
  { timestamps: true },
);

export const TicketAction = mongoose.model("TicketAction", ticketActionSchema);
