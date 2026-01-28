import mongoose from "mongoose";
import { Ticket } from "../model/ticket.model.js";
import { TicketAction } from "../model/ticketAction.model.js";
import { createAuditLog } from "../utils/createAuditLog.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateWorkflowAction } from "../utils/validateWorkflowAction.js";
import connectDB from "../db/db.js";

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
  await connectDB();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      title,
      description,
      priority,
      tags = [], // ✅ NEW
    } = req.body;

    // ✅ Normalize & dedupe tags
    const normalizedTags = [
      ...new Set(tags.map((t) => t.toLowerCase().trim()).filter(Boolean)),
    ];
    const ticket = await Ticket.create(
      [
        {
          title: title,
          description: description,
          priority: priority,
          raisedBy: req.user._id,
          status: "SUBMITTED",
          tags: normalizedTags,
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
      tags: normalizedTags,
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
  await connectDB();

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};

  if (req.query.status) query.status = req.query.status;
  if (req.query.priority) query.priority = req.query.priority;

  if (req.query.search) {
    query.title = { $regex: req.query.search, $options: "i" };
  }

  if (req.query.tags) {
    const tagsArray = req.query.tags.split(",");
    query.tags = { $in: tagsArray };
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
  await connectDB();

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
  await connectDB();
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
  await connectDB();
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { actionType, comment } = req.body;
    const ticketId = req.params.id;

    const REQUIRED_REVERIFY_ROLES = ["operator", "leadership", "management"];

    const ticket = await Ticket.findById(ticketId).session(session);
    if (!ticket) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Ticket not found" });
    }

    // -------------------------
    // Helper: verify all roles responded
    // -------------------------
    const hasAllReverifyResponses = async () => {
      const actions = await TicketAction.find({
        ticketId,
        actionType: "REVERIFY_RESPONSE",
      }).session(session);

      const respondedRoles = new Set(actions.map((a) => a.role));
      return REQUIRED_REVERIFY_ROLES.every((r) => respondedRoles.has(r));
    };

    // -------------------------
    // Validate workflow
    // -------------------------
    validateWorkflowAction({
      ticketStatus: ticket.status,
      userRole: req.user.role,
      actionType,
    });

    const previousStatus = ticket.status;
    let nextStatus = previousStatus;
    let auditorDecision = null;

    // -------------------------
    // Auditor logic
    // -------------------------
    if (
      req.user.role === "auditor" &&
      ["AUDITOR_APPROVED", "AUDITOR_REJECTED"].includes(actionType) &&
      ticket.status === "REVERIFY"
    ) {
      const isComplete = await hasAllReverifyResponses(ticket._id);

      if (!isComplete) {
        throw new Error(
          "Reverify responses pending. Auditor cannot finalize yet.",
        );
      }
    }
    if (actionType === "AUDITOR_APPROVED") {
      nextStatus = "CLOSED";
      auditorDecision = "APPROVED";
    }

    if (actionType === "AUDITOR_REJECTED") {
      nextStatus = "CLOSED";
      auditorDecision = "REJECTED";
    }

    // -------------------------
    // Auditor triggers REVERIFY
    // -------------------------
    if (actionType === "AUDITOR_REVERIFY") {
      nextStatus = "REVERIFY";
      auditorDecision = "REVERIFY";
    }

    // -------------------------
    // Prevent auto-forward on REVERIFY_RESPONSE
    // -------------------------
    if (actionType !== "REVERIFY_RESPONSE") {
      const rule = validateWorkflowAction({
        ticketStatus: ticket.status,
        userRole: req.user.role,
        actionType,
      });

      if (rule?.nextStatus) {
        nextStatus = rule.nextStatus;
      }
    }

    // -------------------------
    // Persist ticket
    // -------------------------
    ticket.status = nextStatus;
    if (auditorDecision) ticket.auditorDecision = auditorDecision;

    await ticket.save({ session });

    // -------------------------
    // Timeline
    // -------------------------
    await TicketAction.create(
      [
        {
          ticketId,
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

    // -------------------------
    // Audit log
    // -------------------------
    await createAuditLog({
      session,
      entity: "TICKET",
      entityId: ticketId,
      action: actionType,
      performedBy: req.user._id,
      role: req.user.role,
      previousState: previousStatus,
      newState: nextStatus,
      metadata: { comment, auditorDecision },
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
