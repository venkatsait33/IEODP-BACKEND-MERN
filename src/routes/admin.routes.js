import express from "express";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import {
  assignUserRole,
  changeUserStatus,
  getAllUsers,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/users", isAuthenticated, authorizeRoles("admin"), getAllUsers);

router.patch(
  "/:id/change-status",
  isAuthenticated,
  authorizeRoles("admin"),
  changeUserStatus,
);

router.patch(
  "/:id/assign-role",
  isAuthenticated,
  authorizeRoles("admin"),
  assignUserRole,
);

export default router;
