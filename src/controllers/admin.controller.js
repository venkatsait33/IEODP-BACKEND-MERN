import connectDB from "../db/db.js";
import { AuditLog } from "../model/auditLog.model.js";
import { User } from "../model/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllUsers = asyncHandler(async (req, res, next) => {
  await connectDB();
  const { _id, role } = req.user;

  if (role !== "admin") {
    return res.status(403).json({
      message: "You are not authorized to perform this action",
      success: false,
    });
  }

  const users = await User.find().select("-password");

  return res.status(200).json({
    message: "Users retrieved successfully",
    users,
    success: true,
  });
});

export const changeUserStatus = asyncHandler(async (req, res, next) => {
  await connectDB();
  const { role } = req.user;
  const id = req.params.id;
  const { accountStatus } = req.body;

  if (role !== "admin") {
    return res.status(403).json({
      message: "You are not authorized to perform this action",
      success: false,
    });
  }
  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
      success: false,
    });
  }

  user.accountStatus = accountStatus;
  await user.save();

  return res.status(200).json({
    message: "User status updated successfully",
    user,
    success: true,
  });
});

/**
 * ADMIN: Assign role & status to user
 * PATCH /api/admin/users/:id/assign-role
 */
export const assignUserRole = async (req, res) => {
  await connectDB();
  try {
    const adminRole = req.user.role;
    const { role, accountStatus } = req.body; // ✅ FROM BODY
    const userId = req.params.id;

    if (adminRole !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const allowedRoles = [
      "operator",
      "admin",
      "leadership",
      "management",
      "auditor",
    ];

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const allowedStatuses = ["active", "inactive", "pending", "suspended"];
    if (accountStatus && !allowedStatuses.includes(accountStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const previousState = {
      role: user.role,
      accountStatus: user.accountStatus,
    };

    if (role) user.role = role;
    if (accountStatus) user.accountStatus = accountStatus;

    await user.save();

    // 🔐 Audit log
    await AuditLog.create({
      entity: "USER",
      entityId: user._id,
      action: "USER_ROLE_UPDATED",
      performedBy: req.user._id,
      role: adminRole,
      previousState,
      newState: {
        role: user.role,
        accountStatus: user.accountStatus,
      },
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Assign role error:", error);
    res.status(500).json({ message: "Failed to update user" });
  }
};
