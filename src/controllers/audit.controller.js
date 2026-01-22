import mongoose from "mongoose";
import { Ticket } from "../model/ticket.model.js";
import { TicketAction } from "../model/ticketAction.model.js";

export const getAuditLogsByTicketId = async (req, res) => {
  const { ticketId } = req.params;

  // ✅ Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    return res.status(400).json({ message: "Invalid ticket id" });
  }

  // ✅ Check ticket exists
  const ticket = await Ticket.findById(ticketId).select("_id");
  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  // ✅ Fetch audit timeline
  const auditLogs = await TicketAction.find({ ticketId })
    .populate("performedBy", "userName email role")
    .sort({ createdAt: 1 }); // chronological order

  res.status(200).json({
    ticketId,
    totalEvents: auditLogs.length,
    timeline: auditLogs,
  });
};

export const getAuditLogAll = async (req, res) => {
  const auditLogs = await TicketAction.find()
    .populate("performedBy", "userName email role")
    .sort({ createdAt: 1 }); // chronological order

  res.status(200).json({
    totalEvents: auditLogs.length,
    timeline: auditLogs,
  });
};
