import express from "express";
import {
  getAuditLogAll,
  getAuditLogsByTicketId,
} from "../controllers/audit.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const routes = express.Router();

routes.get("/:ticketId", isAuthenticated, getAuditLogsByTicketId);
routes.get("/", isAuthenticated, getAuditLogAll);

export default routes;
