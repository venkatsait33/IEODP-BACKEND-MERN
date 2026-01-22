import { getDashboardConfigByRole } from "../config/dashboard.config.js";
import { Ticket } from "../model/ticket.model.js";
import { User } from "../model/user.model.js";

/**
 * GET /api/v1/dashboard
 * Role-aware dashboard data provider
 */
export const getDashboardData = async (req, res) => {
  try {
    const { role } = req.user;

    /**
     * 1. Load base data
     */
    const [tickets, users] = await Promise.all([
      Ticket.find({}).populate("raisedBy", "userName role").lean(),

      User.find({}).select("userName role status createdAt").lean(),
    ]);

    /**
     * 2. Dashboard widget config (role-based)
     */
    const config = getDashboardConfigByRole(role);

    res.status(200).json({
      success: true,
      tickets,
      users,
      config,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};
