import mongoose from "mongoose";
import { Ticket } from "../model/ticket.model.js";
import { TicketAction } from "../model/ticketAction.model.js";
import { createAuditLog } from "../utils/createAuditLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateWorkflowAction } from "../utils/validateWorkflowAction.js";

// export const createTicket = async (req, res) => {
//   const ticket = await Ticket.create({
//     ...req.body,
//     raisedBy: req.user._id,
//   });

//   await TicketAction.create({
//     ticketId: ticket._id,
//     performedBy: req.user._id,
//     role: req.user.role,
//     actionType: "CREATED",
//     newStatus: "SUBMITTED",
//   });

//   res.status(201).json(ticket);
// };

export const createTicket = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const ticket = await Ticket.create(
      [
        {
          title: req.body.title,
          description: req.body.description,
          priority: req.body.priority,
          raisedBy: req.user._id,
          status: "SUBMITTED",
        },
      ],
      { session },
    );

    await TicketAction.create(
      [
        {
          ticketId: ticket[0]._id,
          performedBy: req.user._id,
          role: req.user.role,
          actionType: "CREATED",
          newStatus: "SUBMITTED",
        },
      ],
      { session },
    );

    await createAuditLog({
      session,
      entity: "TICKET",
      entityId: ticket[0]._id,
      action: "TICKET_CREATED",
      performedBy: req.user._id,
      role: req.user.role,
      previousState: null,
      newState: ticket[0].toObject(),
    });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(ticket[0]);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({ message: "Ticket creation failed" });
  }
};

export const getTickets = async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};

  if (req.query.status) query.status = req.query.status;
  if (req.query.priority) query.priority = req.query.priority;
  if (req.query.search) {
    query.title = { $regex: req.query.search, $options: "i" };
  }

  const tickets = await Ticket.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("raisedBy", "userName role");

  res.json(tickets);
};

export const getTicketsByRole = asyncHandler(async (req, res) => {
  const query = {};

  // 🔐 Operator sees only own tickets
  if (req.user.role === "operator") {
    query.raisedBy = req.user._id;
  }

  const tickets = await Ticket.find(query)
    .populate("raisedBy", "userName role")
    .sort({ createdAt: -1 });

  res.json(tickets);
});

export const getTicketById = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate(
    "raisedBy",
    "userName role",
  );

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  const timeline = await TicketAction.find({ ticketId: ticket._id })
    .populate("performedBy", "userName role")
    .sort({ createdAt: 1 });

  res.json({ ticket, timeline });
});

export const addTicketAction = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { actionType, comment } = req.body;

    const ticket = await Ticket.findById(req.params.id).session(session);
    if (!ticket) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Ticket not found" });
    }

    // ✅ Validate workflow rules
    const rule = validateWorkflowAction({
      ticketStatus: ticket.status,
      userRole: req.user.role,
      actionType,
    });

    const previousStatus = ticket.status;
    let nextStatus = previousStatus;
    let auditorDecision = null;

    // ✅ Auditor actions
    if (actionType === "AUDITOR_APPROVED") {
      nextStatus = "CLOSED";
      auditorDecision = "APPROVED";
    }

    if (actionType === "AUDITOR_REJECTED") {
      nextStatus = "CLOSED";
      auditorDecision = "REJECTED";
    }

    if (actionType === "AUDITOR_REVERIFY") {
      nextStatus = "REVERIFY";
      auditorDecision = "REVERIFY";
    }

    // ✅ Other workflow transitions
    if (rule.nextStatus && previousStatus === ticket.status) {
      nextStatus = rule.nextStatus;
    }

    // ✅ Update ticket
    ticket.status = nextStatus;
    if (auditorDecision) ticket.auditorDecision = auditorDecision;

    await ticket.save({ session });

    // ✅ Ticket timeline (workflow history)
    await TicketAction.create(
      [
        {
          ticketId: ticket._id,
          performedBy: req.user._id,
          role: req.user.role,
          actionType,
          comment,
          previousStatus,
          newStatus: nextStatus,
        },
      ],
      { session },
    );

    // ✅ Audit log (enterprise-grade)
    await createAuditLog({
      session,
      entity: "TICKET",
      entityId: ticket._id,
      action: actionType,
      performedBy: req.user._id,
      role: req.user.role,
      previousState: previousStatus,
      newState: nextStatus,
      metadata: {
        comment,
        auditorDecision,
      },
    });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json(ticket);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(403).json({ message: err.message });
  }
};
