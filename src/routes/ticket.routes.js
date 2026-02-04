import express from "express";
import {
  addTicketAction,
  assignTicketUser,
  createTicket,
  getTicketById,
  getTickets,
  getTicketsByRole,
} from "../controllers/ticket.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { idempotencyMiddleware } from "../middleware/idempotency.js";

const routes = express.Router();

routes.post("/create", isAuthenticated, idempotencyMiddleware, createTicket);

routes.get("/", isAuthenticated, getTickets);
routes.get("/operator", isAuthenticated, getTicketsByRole);

routes.get("/:id", isAuthenticated, getTicketById);

routes.post(
  "/:id/action",
  isAuthenticated,
  idempotencyMiddleware,
  addTicketAction,
);

routes.patch("/:id/assign", isAuthenticated, assignTicketUser);
export default routes;
